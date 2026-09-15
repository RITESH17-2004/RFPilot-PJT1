import json
import asyncio
import aiofiles
import os
from datetime import datetime
from typing import List
import logging

class APIRequestLogger:
    """
    Dummy logger to fulfill existing references without creating physical session files.
    JSON logging has been disabled.
    """
    
    def __init__(self, data_folder: str = "data"):
        self.data_folder = data_folder
        self.session_file = None
        # File creation disabled
    
    def _ensure_data_folder(self):
        """No-op: Data folder creation disabled."""
        pass
    
    def _create_session_file(self):
        """No-op: Session file creation disabled."""
        pass
    
    async def log_request(self, document_url: str, questions: List[str]):
        """No-op: Request logging disabled."""
        pass
    
    async def _append_to_file(self, request_data: dict):
        """No-op: Appending to file disabled."""
        pass
    
    def get_session_file(self) -> str:
        """Returns None as session files are disabled."""
        return None
