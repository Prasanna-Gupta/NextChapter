import os
import sys
import types
import importlib
import importlib.util
from pathlib import Path

from fastapi.testclient import TestClient


class _FakeResult:
    def __init__(self, content):
        self.choices = [types.SimpleNamespace(message=types.SimpleNamespace(content=content))]


class _FakeCompletions:
    def __init__(self, behavior='normal'):
        self._behavior = behavior

    def create(self, model, messages, temperature, max_tokens):
        if self._behavior == 'raise':
            raise RuntimeError('upstream error')

        last = messages[-1]['content'] if messages else ''
        if 'approve-me' in last:
            return _FakeResult('APPROVED')
        if 'reject-me' in last:
            return _FakeResult('REJECTED: insults, profanity')
        # unexpected output path
        return _FakeResult('SOMETHING ELSE')


class _FakeChat:
    def __init__(self, behavior='normal'):
        self.completions = _FakeCompletions(behavior=behavior)


class _FakeClient:
    def __init__(self, api_key=None, behavior='normal'):
        self.chat = _FakeChat(behavior=behavior)


def _import_app_with_fake_groq(behavior='normal'):
    # Ensure env var is present before import
    os.environ.setdefault('GROQ_API_KEY', 'test-key')

    # Inject a fake `groq` module so import-time Groq() instantiation uses our fake
    fake_mod = types.ModuleType('groq')
    fake_mod.Groq = lambda api_key: _FakeClient(api_key=api_key, behavior=behavior)
    sys.modules['groq'] = fake_mod

    # Import the app module by file path (the folder isn't a package)
    app_path = Path(__file__).resolve().parents[1] / 'main.py'
    spec = importlib.util.spec_from_file_location('main', str(app_path))
    module = importlib.util.module_from_spec(spec)
    sys.modules['main'] = module
    spec.loader.exec_module(module)
    return module


def test_moderate_approved():
    app = _import_app_with_fake_groq(behavior='normal')
    client = TestClient(app.app)

    resp = client.post('/api/moderate', json={'text': 'please approve-me'})
    assert resp.status_code == 200
    body = resp.json()
    assert body['is_appropriate'] is True
    assert 'allowed' in body['message'].lower()
    assert body['reasons'] == []


def test_moderate_rejected():
    app = _import_app_with_fake_groq(behavior='normal')
    client = TestClient(app.app)

    resp = client.post('/api/moderate', json={'text': 'this should reject-me'})
    assert resp.status_code == 200
    body = resp.json()
    assert body['is_appropriate'] is False
    assert 'rejected' in body['message'].lower()
    assert isinstance(body['reasons'], list) and len(body['reasons']) >= 1


def test_moderate_unexpected_output():
    app = _import_app_with_fake_groq(behavior='normal')
    client = TestClient(app.app)

    resp = client.post('/api/moderate', json={'text': 'some other content'})
    assert resp.status_code == 200
    body = resp.json()
    # unexpected model output should be treated as rejected with 'unclassified' reason
    assert body['is_appropriate'] is False
    assert 'unclassified' in (body.get('reasons') or [])
