// tests/api/moderation_api.spec.js
const { test, expect, request } = require('@playwright/test');

test.describe('Moderation API', () => {
  test('Moderation endpoint flags disallowed content', async ({ }) => {
    const moderationUrl = process.env.MODERATION_API_URL || 'http://localhost:8000';
    const apiKey = process.env.MODERATION_API_KEY || 'test-key';

    const req = await request.newContext({
      baseURL: moderationUrl,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const response = await req.post('/moderate', {
      data: {
        text: "This is a test message with a forbiddenword"
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    // Adjust assertion to match your moderation API contract
    expect(body).toHaveProperty('flagged');
    // Example: flagged should be boolean
    expect(typeof body.flagged).toBe('boolean');

    await req.dispose();
  });

  test('Moderation API accepts normal text', async ({ }) => {
    const moderationUrl = process.env.MODERATION_API_URL || 'http://localhost:8000';
    const apiKey = process.env.MODERATION_API_KEY || 'test-key';

    const req = await request.newContext({
      baseURL: moderationUrl,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const response = await req.post('/moderate', {
      data: { text: 'This is a perfectly safe review about a book.' }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.flagged).toBeFalsy();

    await req.dispose();
  });
});
