import os
import re
from typing import Optional

def _clean_env(key: str, default: str = None) -> Optional[str]:
    val = os.getenv(key, default)
    if val:
        # Aggressive Sanitization: Keep ONLY printable ASCII (range 32-126)
        # This surgically removes terminal 'junk' like │, ┤, or hidden control codes.
        return re.sub(r'[^\x20-\x7E]', '', val).strip()
    return val

class Config:
    """
    Configuration class for the application, managing various settings
    such as API keys, model names, logging levels, and resource limits.
    """
    # API Keys and Tokens
    MISTRAL_API_KEY: Optional[str] = _clean_env('MISTRAL_API_KEY')
    MISTRAL_API_KEY_2: Optional[str] = _clean_env('MISTRAL_API_KEY_2')
    BEARER_TOKEN: Optional[str] = _clean_env('BEARER_TOKEN')

    # Directory for caching models
    MODEL_CACHE_DIR: str = _clean_env('MODEL_CACHE_DIR', '/tmp/models')

    # Logging level
    LOG_LEVEL: str = _clean_env('LOG_LEVEL', 'INFO')

    # Maximum number of worker threads
    MAX_WORKERS: int = int(_clean_env('MAX_WORKERS', '2'))

    # Embedding model configuration
    EMBEDDING_MODEL: str = "paraphrase-MiniLM-L3-v2"
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    SIMILARITY_THRESHOLD: float = 0.25
    MAX_RELEVANT_CHUNKS: int = 12

    # Large Language Model (LLM) configuration
    LLM_MODEL: str = "mistral-medium"
    LLM_TEMPERATURE: float = 0.1
    MAX_TOKENS: int = 100

    # Database configuration
    # Note: DB URL can contain complex chars in password, but we strip trailing junk
    DATABASE_URL: Optional[str] = _clean_env('DATABASE_URL')

    # Specific Mistral model name
    MISTRAL_MODEL_NAME: str = _clean_env('MISTRAL_MODEL_NAME', 'mistral-small-latest')

    # --- INSTITUTIONAL METADATA (Indian Bank) ---
    BANK_NAME: str = "INDIAN BANK"
    BANK_DIVISION: str = "DIGITAL PROCUREMENT CELL"
    OFFICER_NAME: str = "General Manager (IT)"
    OFFICER_CONTACT: str = "procurement@indianbank.co.in"
    OFFICER_PHONE: str = "+91 44 2813 4300"
    HEADQUARTERS: str = "Chennai, India"
