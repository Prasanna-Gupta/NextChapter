import os
import sys
from pathlib import Path

# Set env vars before importing main
os.environ.setdefault('SUPABASE_URL', 'https://test.supabase.co')
os.environ.setdefault('SUPABASE_SERVICE_KEY', 'test-service-key')
os.environ.setdefault('PINECONE_API_KEY', 'test-pinecone-key')

# Create a tests directory if it doesn't exist
tests_dir = Path(__file__).parent
tests_dir.mkdir(exist_ok=True)

def test_get_text_to_embed():
    """Test the get_text_to_embed helper function."""
    # Import after setting env vars
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from main import get_text_to_embed
    
    book = {
        'title': 'Test Book',
        'author': 'Test Author',
        'genre': 'Fiction',
        'genres': ['Fiction', 'Adventure']
    }
    
    result = get_text_to_embed(book)
    
    assert 'Test Book' in result
    assert 'Test Author' in result
    assert 'Fiction' in result
    assert 'Adventure' in result


def test_get_text_to_embed_missing_fields():
    """Test get_text_to_embed with missing fields."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from main import get_text_to_embed
    
    book = {}
    result = get_text_to_embed(book)
    
    assert isinstance(result, str)
    assert 'Title:' in result
    assert 'Author:' in result


def test_calculate_love_score_full():
    """Test calculate_love_score with all fields."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from main import calculate_love_score
    
    history_item = {
        'scroll_depth': 100,
        'rating': 5,
        'was_in_watchlist': True
    }
    
    score = calculate_love_score(history_item)
    
    assert isinstance(score, float)
    assert 0 <= score <= 1
    assert score == 1.0  # Perfect score


def test_calculate_love_score_partial():
    """Test calculate_love_score with partial data."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from main import calculate_love_score
    
    history_item = {
        'scroll_depth': 50,
        'rating': 3,
        'was_in_watchlist': False
    }
    
    score = calculate_love_score(history_item)
    
    assert isinstance(score, float)
    assert 0 <= score <= 1


def test_calculate_love_score_empty():
    """Test calculate_love_score with empty data."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from main import calculate_love_score
    
    history_item = {}
    
    score = calculate_love_score(history_item)
    
    assert score == 0.0


def test_format_books():
    """Test format_books function."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from main import format_books
    
    raw_books = [
        {'id': '1', 'title': 'Book 1', 'author': 'Author 1', 'cover_image': 'url1'},
        {'id': '2', 'title': 'Book 2', 'author': 'Author 2', 'cover_image': 'url2'},
        {'id': '3', 'title': 'Book 3', 'author': 'Author 3', 'cover_image': 'url3'},
        {'id': '4', 'title': 'Book 4', 'author': 'Author 4', 'cover_image': 'url4'},
        {'id': '5', 'title': 'Book 5', 'author': 'Author 5', 'cover_image': 'url5'},
        {'id': '6', 'title': 'Book 6', 'author': 'Author 6', 'cover_image': 'url6'},
    ]
    
    formatted = format_books(raw_books)
    
    assert len(formatted) == 5  # Should return only top 5
    assert formatted[0]['book_id'] == '1'
    assert formatted[0]['title'] == 'Book 1'
    assert formatted[0]['author'] == 'Author 1'
    assert formatted[0]['cover_url'] == 'url1'


def test_format_books_empty():
    """Test format_books with empty list."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from main import format_books
    
    formatted = format_books([])
    
    assert formatted == []


if __name__ == '__main__':
    # Run tests manually
    print("Running tests...")
    test_get_text_to_embed()
    print("✓ test_get_text_to_embed passed")
    
    test_get_text_to_embed_missing_fields()
    print("✓ test_get_text_to_embed_missing_fields passed")
    
    test_calculate_love_score_full()
    print("✓ test_calculate_love_score_full passed")
    
    test_calculate_love_score_partial()
    print("✓ test_calculate_love_score_partial passed")
    
    test_calculate_love_score_empty()
    print("✓ test_calculate_love_score_empty passed")
    
    test_format_books()
    print("✓ test_format_books passed")
    
    test_format_books_empty()
    print("✓ test_format_books_empty passed")
    
    print("\nAll 7 tests passed!")
