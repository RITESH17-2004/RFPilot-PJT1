import asyncio
import os
from src.rag.document_text_extractor import DocumentTextExtractor
from concurrent.futures import ThreadPoolExecutor

async def inspect_pdfs():
    executor = ThreadPoolExecutor(max_workers=4)
    extractor = DocumentTextExtractor(executor)
    
    pdf_files = [
        "data/knowledge_base/RBI Master Direction - Outsourcing of IT Services (April 2024 Compliance).pdf",
        "data/knowledge_base/Word Bank - RFP for Consulting Services.pdf",
        "data/knowledge_base/World Bank - RFP for Information Systems (2023 Edition).pdf"
    ]
    
    for pdf in pdf_files:
        if os.path.exists(pdf):
            print(f"\n--- Extracting from: {pdf} ---")
            file_url = f"file://{os.path.abspath(pdf)}"
            chunks = []
            async for chunk in extractor.process_document(file_url):
                chunks.append(chunk['text'])
            
            full_text = " ".join(chunks)
            print(f"Total characters: {len(full_text)}")
            print(f"Sample (first 1000 chars):\n{full_text[:1000]}...")
            
            # Save a copy of the full text for easier reference/re-indexing
            txt_filename = pdf.replace(".pdf", ".txt")
            with open(txt_filename, "w", encoding="utf-8") as f:
                f.write(full_text)
            print(f"Saved extracted text to: {txt_filename}")

    await extractor.shutdown()
    executor.shutdown()

if __name__ == "__main__":
    asyncio.run(inspect_pdfs())
