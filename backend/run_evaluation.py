"""
Convenience entry point to run the master evaluation suite from backend/
Usage: python run_evaluation.py
"""
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from evaluation.evaluate import main

if __name__ == "__main__":
    main()
