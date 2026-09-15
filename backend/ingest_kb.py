import os
import asyncio
import logging
from src.rag.document_text_extractor import DocumentTextExtractor
from src.rag.embedding_generator import EmbeddingGenerator
from src.rag.faiss_vector_store import FAISSVectorStore
from config import Config
from concurrent.futures import ThreadPoolExecutor

# Define our specialized categories
CATEGORIES = ["rfp", "legal", "compliance", "procurement", "technical"]

async def ingest_categorized_kb(root_path: str):
    """
    Ingests documents into separate FAISS indexes based on folder names.
    """
    logging.basicConfig(level=logging.INFO)
    executor = ThreadPoolExecutor(max_workers=4)
    doc_processor = DocumentTextExtractor(executor)
    embedding_engine = EmbeddingGenerator(Config.EMBEDDING_MODEL, "cpu", executor)
    
    cache_dir = ".cache/vector_stores/kb"
    os.makedirs(cache_dir, exist_ok=True)

    for category in CATEGORIES:
        category_path = os.path.join(root_path, category)
        if not os.path.exists(category_path):
            os.makedirs(category_path, exist_ok=True)
            logging.warning(f"Created empty directory for category: {category}. Please add files!")
            continue

        logging.info(f"--- Processing Category: {category} ---")
        
        # Create a fresh vector store for this category
        vector_store = FAISSVectorStore(embedding_engine.get_embedding_dimension(), executor)
        index_cache_path = os.path.join(cache_dir, category)

        files = [f for f in os.listdir(category_path) if f.endswith(('.pdf', '.docx', '.xlsx', '.txt'))]
        if not files:
            logging.info(f"No files in {category}, skipping.")
            continue

        for filename in files:
            file_path = os.path.join(category_path, filename)
            file_url = f"file://{os.path.abspath(file_path)}"
            
            try:
                document_chunks = []
                async for chunk in doc_processor.process_document(file_url):
                    document_chunks.append(chunk)
                
                if document_chunks:
                    embeddings = await embedding_engine.generate_embeddings(document_chunks)
                    await vector_store.add_documents(document_chunks, embeddings)
                    logging.info(f"Ingested {filename}")
            except Exception as e:
                logging.error(f"Error {filename}: {e}")

        # Save this specific index
        await vector_store.save_index(index_cache_path, f"Bank {category.upper()} Index")
    
    logging.info("Multi-Index Ingestion Complete.")

if __name__ == "__main__":
    kb_root = "data/knowledge_base"
    asyncio.run(ingest_categorized_kb(kb_root))
