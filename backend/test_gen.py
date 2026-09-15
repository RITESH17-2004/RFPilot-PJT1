import os
import json
import hashlib
import sys

# MUST be first
original_md5 = hashlib.md5
def patched_md5(*args, **kwargs):
    kwargs.pop('usedforsecurity', None)
    return original_md5(*args, **kwargs)
hashlib.md5 = patched_md5

from sqlalchemy.orm import Session
from src.database import SessionLocal, engine
from src.models import RFP
from src.rfp.pdf_generator import PDFGenerator

def test_gen(rfp_id):
    db = SessionLocal()
    pdf_gen = PDFGenerator()
    try:
        rfp = db.query(RFP).filter(RFP.id == rfp_id).first()
        if not rfp:
            print(f"RFP {rfp_id} not found")
            return
        
        print(f"--- RFP {rfp_id} ---")
        sections = json.loads(rfp.content)
        bank_name = rfp.project_details.get('bank_profile', {}).get('bank_name', 'Indian Bank')
        deadline = rfp.project_details.get('submission_deadline', 'As per Schedule')
        
        test_file = f"test_rfp_{rfp_id}.pdf"
        pdf_gen.generate_rfp_pdf(rfp_id, rfp.title, sections, bank_name, submission_deadline=deadline)
        # The default output is in generated_rfps/
        expected_path = os.path.join("generated_rfps", f"rfp_{rfp_id}.pdf")
        if os.path.exists(expected_path):
            print(f"Successfully generated {expected_path}, size: {os.path.getsize(expected_path)}")
        else:
            print(f"Failed to find {expected_path}")
                
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_gen(int(sys.argv[1]))
    else:
        test_gen(29)
        test_gen(27)
        test_gen(26)
