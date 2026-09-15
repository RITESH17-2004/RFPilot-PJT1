import os
import json
from sqlalchemy.orm import Session
from src.database import SessionLocal, engine
from src.models import RFP

def inspect_data_tables_raw(rfp_id):
    db = SessionLocal()
    try:
        rfp = db.query(RFP).filter(RFP.id == rfp_id).first()
        if not rfp:
            print(f"RFP {rfp_id} not found")
            return
        
        print(f"--- RFP {rfp_id} Raw Data Tables ---")
        if rfp.content:
            sections = json.loads(rfp.content)
            for section in sections:
                if "data_tables" in section and section["data_tables"]:
                    print(f"Section {section.get('section_id')}: {section.get('title')}")
                    print(f"  data_tables type: {type(section['data_tables'])}")
                    for i, table in enumerate(section["data_tables"]):
                        print(f"  Table {i} type: {type(table)}")
                        print(f"  Table {i} value: {table}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_data_tables_raw(29)
    inspect_data_tables_raw(27)
