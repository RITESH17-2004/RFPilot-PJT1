import re
import unicodedata

def clean_escape_characters(text: str) -> str:
    """
    Removes various unwanted escape characters and normalizes text for cleaner processing.
    Handles backslashes, newlines, tabs, and converts smart quotes to straight quotes.
    """
    if not text: return ""

    # Normalize quotes FIRST before any Unicode normalization
    text = text.replace('“', '"').replace('”', '"')  # Smart double quotes
    text = text.replace('‘', "'").replace('’', "'")  # Smart single quotes
    text = text.replace('`', "'").replace('´', "'")  # Backticks and other accents
    
    # Use NFC normalization (Canonical Composition) which is safer for most systems
    text = unicodedata.normalize('NFC', text)
    
    # Remove any remaining backslashes (e.g., \\, \', \")
    text = re.sub(r'\\+', ' ', text)

    # Clean up multiple spaces created by replacements into single spaces
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()