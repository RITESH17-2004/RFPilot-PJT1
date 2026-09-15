import os

kb_path = "data/knowledge_base"

# 1. READ THE EXTRACTED TEXT
with open(f"{kb_path}/RBI Master Direction - Outsourcing of IT Services (April 2024 Compliance).txt", "r", encoding="utf-8") as f:
    rbi_text = f.read()

with open(f"{kb_path}/World Bank - RFP for Information Systems (2023 Edition).txt", "r", encoding="utf-8") as f:
    wb_is_text = f.read()

with open(f"{kb_path}/Word Bank - RFP for Consulting Services.txt", "r", encoding="utf-8") as f:
    wb_consult_text = f.read()

# 2. DEFINE HELPER TO SPLIT LARGE TEXT INTO TOPICAL FILES
def split_and_save(text, category, prefix, num_files=8):
    chunk_size = len(text) // num_files
    for i in range(num_files):
        start = i * chunk_size
        end = (i + 1) * chunk_size if i < num_files - 1 else len(text)
        chunk = text[start:end]
        
        filename = f"{kb_path}/{category}/{prefix}_part_{i+1}.txt"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(f"OFFICIAL BANKING STANDARD - SOURCE: {prefix.upper()}\n\n")
            f.write(chunk)
    print(f"Distributed {len(text)} chars into {num_files} files in {category}.")

# 3. DISTRIBUTE CONTENT
# Compliance -> from RBI
split_and_save(rbi_text, "compliance", "rbi_outsourcing_master", num_files=10)

# Procurement -> from World Bank (Information Systems)
split_and_save(wb_is_text, "procurement", "wb_is_procurement", num_files=12)

# Legal -> from World Bank (Consulting - usually has deep legal/contract terms)
split_and_save(wb_consult_text, "legal", "wb_consult_legal", num_files=10)

# RFP Templates -> using sections of World Bank
split_and_save(wb_is_text[:200000], "rfp", "wb_rfp_templates", num_files=5)

print("SUCCESS: Master PDF content distributed into specialized text silos.")
