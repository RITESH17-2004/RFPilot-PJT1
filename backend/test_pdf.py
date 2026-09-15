import sys
import os
import hashlib

# Monkey-patch hashlib.md5 to handle 'usedforsecurity' error in some environments
original_md5 = hashlib.md5
def patched_md5(*args, **kwargs):
    kwargs.pop('usedforsecurity', None)
    return original_md5(*args, **kwargs)
hashlib.md5 = patched_md5

# Add the parent directory to sys.path so we can import src
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.rfp.pdf_generator import PDFGenerator

def test_pdf_generation():
    generator = PDFGenerator(output_dir="generated_rfps")
    
    sample_llm_markdown = """
# 1. COVER PAGE & GENERAL INFORMATION
Welcome to the Banking RFP.

## 2. EXECUTIVE SUMMARY
This is a **crucial** project for the bank. We expect high quality.

### Important Points
- Must have $50M turnover.
- Must be compliant with RBI guidelines.
- Data must remain in India.

**Budget constraints:**
1. Initial implementation: $1M
2. Maintenance: $200k/year

Thank you for participating.
"""
    
    pdf_path = generator.generate_rfp_pdf(999, "Sample Core Banking RFP", sample_llm_markdown)
    print(f"Generated PDF at: {os.path.abspath(pdf_path)}")

if __name__ == "__main__":
    test_pdf_generation()
