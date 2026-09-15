# -*- coding: utf-8 -*-
import hashlib

# Monkey-patch hashlib.md5 to handle 'usedforsecurity' error in some environments
original_md5 = hashlib.md5
def patched_md5(*args, **kwargs):
    kwargs.pop('usedforsecurity', None)
    return original_md5(*args, **kwargs)
hashlib.md5 = patched_md5

"""
Main FastAPI application file for the LLM-Powered Intelligent Query-Retrieval System.
This file sets up the FastAPI application, defines the API endpoints, and handles the
core logic for processing documents and answering queries.
"""

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.responses import FileResponse, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from concurrent.futures import ThreadPoolExecutor
import asyncio
import logging
import json
import time
import torch
import os
import re
import hashlib

from src.rag.document_text_extractor import DocumentTextExtractor
from src.rag.embedding_generator import EmbeddingGenerator
from src.rag.faiss_vector_store import FAISSVectorStore
from src.rag.query_resolver import QueryResolver
from src.rag.answer_generation_engine import AnswerGenerationEngine
from src.api_request_logger import APIRequestLogger
from src.input_validator import InputValidator, ValidationStatus
from config import Config
from src.rag.intelligent_agent import IntelligentAgent
from src.rag.llm_interaction_service import LLMInteractionService
from src.rag.open_source_llm_engine import OpenSourceLLMEngine
from src.database import Base, engine, get_db
import src.models  # Import all models for table creation
from sqlalchemy.orm import Session

from fastapi.staticfiles import StaticFiles
from src.rfp.pdf_generator import PDFGenerator

# Configure logging for the application
log_level_raw = Config.LOG_LEVEL.strip()
# Use only the first word and uppercase it to avoid hidden terminal junk
log_level_name = log_level_raw.split()[0].upper() if log_level_raw else "INFO"
log_level = getattr(logging, log_level_name, logging.INFO)
if not isinstance(log_level, int): # Ensure we got a valid level, not a function
    log_level = logging.INFO

logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown.
    Initializes core components like thread pool, document processor, embedding engine,
    vector store, query processor, decision engine, request logger, and file validator.
    Checks for GPU availability and sets the device for torch operations.
    """
    logging.info("Application starting up...")
    
    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    logging.info("Database tables verified/created.")

    app.state.executor = ThreadPoolExecutor(max_workers=Config.MAX_WORKERS)

    # Create cache directory for vector stores
    app.state.cache_dir = ".cache/vector_stores"
    os.makedirs(app.state.cache_dir, exist_ok=True)

    # Determine and set the appropriate device (GPU/CPU) for torch
    if torch.cuda.is_available():
        logging.info(f"CUDA GPU available: {torch.cuda.get_device_name(0)}. Using CUDA.")
        app.state.device = "cuda"
        try:
            # Test GPU functionality
            _ = torch.rand(1000, 1000).to(app.state.device) @ torch.rand(1000, 1000).to(app.state.device)
            logging.info("GPU test successful.")
        except Exception as e:
            logging.error(f"GPU test failed: {e}. Falling back to CPU.")
            app.state.device = "cpu"
    else:
        logging.info("No CUDA GPU found. Using CPU.")
        app.state.device = "cpu"

    # Initialize core application components
    app.state.doc_processor = DocumentTextExtractor(app.state.executor)
    app.state.embedding_engine = EmbeddingGenerator(Config.EMBEDDING_MODEL, app.state.device, app.state.executor)
    app.state.vector_store = FAISSVectorStore(app.state.embedding_engine.get_embedding_dimension(), app.state.executor)
    app.state.query_processor = QueryResolver(app.state.embedding_engine, app.state.vector_store)
    app.state.decision_engine = AnswerGenerationEngine(device=app.state.device, executor=app.state.executor)
    
    # Initialize categorized knowledge base for RFP generation
    kb_base_path = os.path.join(app.state.cache_dir, "kb")
    kb_resolvers = {}
    categories = ["rfp", "legal", "compliance", "procurement", "technical"]
    
    for cat in categories:
        cat_index_path = os.path.join(kb_base_path, cat)
        if os.path.exists(cat_index_path):
            logging.info(f"Loading Specialized Knowledge Base: {cat}...")
            # Create a dedicated vector store and resolver for each category
            cat_vector_store = FAISSVectorStore(app.state.embedding_engine.get_embedding_dimension(), app.state.executor)
            await cat_vector_store.load_index(cat_index_path)
            kb_resolvers[cat] = QueryResolver(app.state.embedding_engine, cat_vector_store)
    
    from src.rfp.rfp_generator import RFPGenerator
    app.state.rfp_generator = RFPGenerator(app.state.decision_engine, kb_resolvers)
    from src.rfp.corrigendum_generator import CorrigendumGenerator
    app.state.corrigendum_generator = CorrigendumGenerator(app.state.decision_engine)
    app.state.pdf_generator = PDFGenerator()
    app.state.request_logger = APIRequestLogger()
    app.state.file_validator = InputValidator()

    # Ensure static directory exists for caching generated PDFs
    static_rfp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generated_rfps")
    os.makedirs(static_rfp_dir, exist_ok=True)

    yield
    
    # Gracefully shut down application components
    logging.info("Application shutting down...")
    await app.state.doc_processor.shutdown()
    app.state.executor.shutdown(wait=True)
    logging.info("Application shutdown complete.")

# Initialize FastAPI application
app = FastAPI(
    title="LLM-Powered Intelligent Query-Retrieval System",
    description="Process documents and answer queries with explainable decisions",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # Specified origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup HTTP Bearer token security
security = HTTPBearer()

class QueryRequest(BaseModel):
    """Request model for document and question submission."""
    documents: str
    questions: List[str]

class QueryResponse(BaseModel):
    """Response model for answers to submitted questions."""
    answers: List[str]

class BankProfile(BaseModel):
    """Profile of the bank issuing the RFP."""
    bank_name: str
    department: str
    contact_person: str
    contact_email: str
    location: str

class RFPCreateRequest(BaseModel):
    """Request model for creating a new RFP draft with expert-grade parameters."""
    title: str
    project_type: str # Security, Cloud, App, CBS, Payments
    budget: str
    timeline: str
    requirements: str
    submission_deadline: str
    issuance_date: str
    evaluation_strategy: str # e.g., QCBS 70:30, L1
    bank_profile: BankProfile
    # Expert Mode Fields:
    eligibility_criteria: Optional[str] = None
    compliance_standards: Optional[str] = None
    technical_stack: Optional[str] = None
    sla_requirements: Optional[str] = None

class RFPResponse(BaseModel):
    """Response model for RFP details."""
    id: int
    title: str
    status: str
    content: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: str

class VendorQueryRequest(BaseModel):
    """Request model for vendor questions."""
    rfp_id: int
    question: str

class VendorQueryResponse(BaseModel):
    """Response model for vendor questions."""
    id: int
    question: str
    answer: Optional[str] = None
    status: str
    is_duplicate: bool

class BankQueryApproveRequest(BaseModel):
    """Request model for bank to approve/edit a vendor query answer."""
    bank_answer: str

class RFPUpdateRequest(BaseModel):
    """Request model for updating an RFP."""
    updated_content: Optional[str] = None # Optional: If missing, AI will generate it from summary
    change_summary: str

class CorrigendumResponse(BaseModel):
    """Response model for corrigendum notices."""
    id: int
    rfp_id: int
    version: int
    change_summary: str
    full_notice: str
    updated_rfp: Optional[RFPResponse] = None # Return the new RFP state too
    created_at: str

class AuditLogResponse(BaseModel):
    """Response model for system audit logs."""
    id: int
    event_type: str
    rfp_id: Optional[int]
    details: Optional[str]
    actor: Optional[str]
    created_at: str

class RFPVersionResponse(BaseModel):
    """Response model for RFP versions (Time Machine)."""
    id: int
    rfp_id: int
    version_number: int
    content: str
    change_summary: Optional[str]
    created_at: str

# NEW AUTH & VENDOR MODELS
class UserSignupRequest(BaseModel):
    email: str
    password: str
    role: str # 'bank' or 'vendor'
    # Profile fields (required for vendors)
    organization: Optional[str] = None
    registration_id: Optional[str] = None
    website: Optional[str] = None
    vendor_category: Optional[str] = None
    years_in_business: Optional[int] = None
    contact_phone: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    status: str
    organization: Optional[str] = None
    registration_id: Optional[str] = None
    website: Optional[str] = None
    vendor_category: Optional[str] = None
    years_in_business: Optional[int] = None
    contact_phone: Optional[str] = None

class VendorActionRequest(BaseModel):
    action: str # 'APPROVE' or 'REJECT'

# --- AUTH ENDPOINTS ---

@app.post("/auth/signup", response_model=UserResponse)
async def signup(request: UserSignupRequest, db: Session = Depends(get_db)):
    """
    Registers a new user. Vendors are set to 'pending' for bank approval.
    Banks are 'approved' by default for this hackathon context.
    """
    # Check if user already exists
    existing = db.query(src.models.User).filter(src.models.User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered.")

    # Status logic
    status = "approved" if request.role == "bank" else "pending"
    
    new_user = src.models.User(
        email=request.email,
        role=request.role,
        status=status,
        organization=request.organization,
        registration_id=request.registration_id,
        website=request.website,
        vendor_category=request.vendor_category,
        years_in_business=request.years_in_business,
        contact_phone=request.contact_phone
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    record_audit(db, "USER_SIGNUP", None, f"New {request.role} registered: {request.email}. Status: {status}", request.email)
    
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        status=new_user.status,
        organization=new_user.organization,
        registration_id=new_user.registration_id,
        website=new_user.website,
        vendor_category=new_user.vendor_category,
        years_in_business=new_user.years_in_business,
        contact_phone=new_user.contact_phone
    )

@app.post("/auth/login", response_model=UserResponse)
async def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Verifies user status. In a real app, this would also verify Supabase JWT.
    """
    user = db.query(src.models.User).filter(src.models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if user.status == "pending":
        raise HTTPException(status_code=403, detail="Account pending bank approval. Please wait for verification.")
    
    if user.status == "rejected":
        raise HTTPException(status_code=403, detail="Account registration declined by bank.")

    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        status=user.status,
        organization=user.organization,
        registration_id=user.registration_id,
        website=user.website,
        vendor_category=user.vendor_category,
        years_in_business=user.years_in_business,
        contact_phone=user.contact_phone
    )

# --- VENDOR REGISTRY (ADMIN) ---

@app.get("/admin/vendors", response_model=List[UserResponse])
async def list_vendors(db: Session = Depends(get_db)):
    """Lists all vendors for approval/management."""
    vendors = db.query(src.models.User).filter(src.models.User.role == "vendor").all()
    return [
        UserResponse(
            id=v.id,
            email=v.email,
            role=v.role,
            status=v.status,
            organization=v.organization,
            registration_id=v.registration_id,
            website=v.website,
            vendor_category=v.vendor_category,
            years_in_business=v.years_in_business,
            contact_phone=v.contact_phone
        ) for v in vendors
    ]

@app.post("/admin/vendors/{vendor_id}/action")
async def take_vendor_action(vendor_id: int, request: VendorActionRequest, db: Session = Depends(get_db)):
    """Bank approves or rejects a vendor profile."""
    vendor = db.query(src.models.User).filter(src.models.User.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found.")
    
    new_status = "approved" if request.action == "APPROVE" else "rejected"
    vendor.status = new_status
    db.commit()
    
    record_audit(db, f"VENDOR_{request.action}", None, f"Vendor {vendor.email} {new_status} by admin.")
    
    return {"message": f"Vendor {new_status} successfully."}

# Helper for Audit Logging with Cryptographic Chaining
def record_audit(db: Session, event_type: str, rfp_id: Optional[int], details: str, actor: str = "SYSTEM"):
    """
    Records a system event with cryptographic chaining to ensure immutability.
    Each log entry contains a hash of itself and the previous entry's hash.
    """
    try:
        # Get the latest audit log to retrieve its hash
        last_log = db.query(src.models.AuditLog).order_by(src.models.AuditLog.id.desc()).first()
        prev_hash = last_log.hash if last_log else "GENESIS_BLOCK_00000000000000000000"
        
        # Prepare data for hashing
        log_data = f"{event_type}|{rfp_id}|{details}|{actor}|{prev_hash}"
        current_hash = hashlib.sha256(log_data.encode('utf-8')).hexdigest()

        log = src.models.AuditLog(
            event_type=event_type,
            rfp_id=rfp_id,
            details=details,
            actor=actor,
            previous_hash=prev_hash,
            hash=current_hash
        )
        db.add(log)
        db.commit()
        logging.info(f"Audit Log Recorded: {event_type} (Hash: {current_hash[:10]}...)")
    except Exception as e:
        logging.error(f"Failed to record cryptographic audit log: {e}")

@app.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(db: Session = Depends(get_db)):
    """Fetches all system audit logs sorted by newest first."""
    logs = db.query(src.models.AuditLog).order_by(src.models.AuditLog.created_at.desc()).all()
    return [
        AuditLogResponse(
            id=log.id,
            event_type=log.event_type,
            rfp_id=log.rfp_id,
            details=log.details,
            actor=log.actor,
            created_at=str(log.created_at)
        ) for log in logs
    ]

@app.post("/rfp/draft/update/{rfp_id}", response_model=RFPResponse)
async def update_draft_silent(rfp_id: int, request: RFPUpdateRequest, db: Session = Depends(get_db)):
    """
    Updates a DRAFT RFP surgically without generating a corrigendum.
    Used during the internal review phase.
    """
    rfp = db.query(src.models.RFP).filter(src.models.RFP.id == rfp_id).first()
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP not found")
    
    if rfp.status != "draft":
        raise HTTPException(status_code=400, detail="Only drafts can be updated silently. Use /rfp/update for published RFPs.")

    try:
        original_content = rfp.content
        if request.updated_content:
            final_updated_content = request.updated_content
        else:
            # Apply intelligent update logic
            final_updated_content, _ = await app.state.corrigendum_generator.apply_intelligent_update(
                original_content, 
                request.change_summary
            )

        # Update RFP in Database
        rfp.content = final_updated_content
        db.commit()
        db.refresh(rfp)

        # Record Audit
        record_audit(db, "DRAFT_REFINED", rfp.id, f"Internal draft refinement: {request.change_summary}")
        
        # Re-generate PDF
        try:
            sections = json.loads(final_updated_content)
        except:
            sections = []

        bank_name = rfp.project_details.get('bank_profile', {}).get('bank_name', 'Indian Bank')
        
        # Extract potentially new deadline from changes
        original_deadline = rfp.project_details.get('submission_deadline', 'As per Schedule')
        new_deadline = await app.state.corrigendum_generator.extract_deadline(original_deadline, request.change_summary)
        
        if new_deadline and new_deadline != original_deadline:
            updated_details = dict(rfp.project_details)
            updated_details['submission_deadline'] = new_deadline
            rfp.project_details = updated_details
            db.commit()
            submission_deadline = new_deadline
        else:
            submission_deadline = original_deadline
            
        app.state.pdf_generator.generate_rfp_pdf(rfp.id, rfp.title, sections, bank_name, submission_deadline=submission_deadline)

        logging.info(f"Draft RFP {rfp_id} updated silently.")
        
        return RFPResponse(
            id=rfp.id,
            title=rfp.title,
            status=rfp.status,
            content=rfp.content,
            pdf_url=f"/static/rfps/rfp_{rfp.id}.pdf",
            created_at=str(rfp.created_at)
        )
    except Exception as e:
        logging.error(f"Error updating draft silently: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update draft: {str(e)}")
@app.post("/rfp/update/{rfp_id}", response_model=CorrigendumResponse)
async def update_rfp_and_generate_corrigendum(rfp_id: int, request: RFPUpdateRequest, db: Session = Depends(get_db)):
    """
    Updates an existing RFP, generates an official corrigendum, and updates the RAG index.
    If 'updated_content' is not provided, the AI automatically applies the 'change_summary' 
    to the existing document.
    """
    rfp = db.query(src.models.RFP).filter(src.models.RFP.id == rfp_id).first()
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP not found")
    
    try:
        # 1. Determine the updated content
        original_content = rfp.content
        diff_data = ""
        if request.updated_content:
            final_updated_content = request.updated_content
        else:
            # INTELLIGENT UPDATE: AI applies changes to original
            logging.info(f"Triggering Intelligent Update for RFP {rfp_id}")
            final_updated_content, diff_data = await app.state.corrigendum_generator.apply_intelligent_update(
                original_content, 
                request.change_summary
            )

        # 2. Generate formal Corrigendum Notice using LLM
        version_num = len(rfp.versions) + 1
        notice_content = await app.state.corrigendum_generator.generate_notice(
            diff_data, 
            None, 
            request.change_summary
        )
        
        # 3. Update RFP in Database
        rfp.content = final_updated_content
        rfp.status = "published" 
        db.commit()
        db.refresh(rfp)
        
        # 4. Create Corrigendum Record
        new_corrigendum = src.models.Corrigendum(
            rfp_id=rfp_id,
            version=version_num,
            change_summary=request.change_summary,
            full_notice=notice_content
        )
        db.add(new_corrigendum)
        
        # 4b. Save Snapshot for Time Machine
        new_version_snapshot = src.models.RFPVersion(
            rfp_id=rfp_id,
            version_number=version_num,
            content=final_updated_content,
            change_summary=request.change_summary
        )
        db.add(new_version_snapshot)
        
        db.commit()
        db.refresh(new_corrigendum)

        # Record Audit
        record_audit(db, "CORRIGENDUM_ISSUED", rfp_id, f"Formal Corrigendum v{version_num} issued: {request.change_summary}")
        
        # 5. Update RAG Index
        try:
            sections = json.loads(rfp.content)
            plain_text_content = ""
            for s in sections:
                plain_text_content += f"{s.get('title', '')}\n{s.get('executive_summary', '')}\n"
                for c in s.get('clauses', []):
                    plain_text_content += f"{c.get('heading', '')} {c.get('content', '')}\n"
        except:
            plain_text_content = rfp.content
            sections = []

        document_chunks = [chunk for chunk in app.state.doc_processor._create_chunks_generator(plain_text_content)]
        embeddings = await app.state.embedding_engine.generate_embeddings(document_chunks)

        await app.state.vector_store.clear()
        await app.state.vector_store.add_documents(document_chunks, embeddings)
        
        # PERSIST TO DISK: Crucial for the query portal to see updates!
        import hashlib
        cache_filename = hashlib.sha256(f"rfp_doc_{rfp_id}".encode('utf-8')).hexdigest()
        cache_filepath = os.path.join(app.state.cache_dir, cache_filename)
        await app.state.vector_store.save_index(cache_filepath, plain_text_content)

        # 6. Re-generate PDF with updated content
        bank_name = rfp.project_details.get('bank_profile', {}).get('bank_name', 'Indian Bank')
        
        # Extract potentially new deadline from changes
        original_deadline = rfp.project_details.get('submission_deadline', 'As per Schedule')
        new_deadline = await app.state.corrigendum_generator.extract_deadline(original_deadline, request.change_summary)
        
        if new_deadline and new_deadline != original_deadline:
            updated_details = dict(rfp.project_details)
            updated_details['submission_deadline'] = new_deadline
            rfp.project_details = updated_details
            db.commit()
            submission_deadline = new_deadline
        else:
            submission_deadline = original_deadline
            
        app.state.pdf_generator.generate_rfp_pdf(rfp.id, rfp.title, sections, bank_name, submission_deadline=submission_deadline)

        logging.info(f"RFP {rfp_id} updated via intelligent logic. Corrigendum {version_num} issued.")
        
        return CorrigendumResponse(
            id=new_corrigendum.id,
            rfp_id=new_corrigendum.rfp_id,
            version=new_corrigendum.version,
            change_summary=new_corrigendum.change_summary,
            full_notice=new_corrigendum.full_notice,
            updated_rfp=RFPResponse(
                id=rfp.id,
                title=rfp.title,
                status=rfp.status,
                content=rfp.content,
                pdf_url=f"/static/rfps/rfp_{rfp.id}.pdf",
                created_at=str(rfp.created_at)
            ),
            created_at=str(new_corrigendum.created_at)
        )
    except Exception as e:
        logging.error(f"Error updating RFP: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update RFP: {str(e)}")

@app.get("/rfp/{rfp_id}/corrigenda", response_model=List[CorrigendumResponse])
async def get_rfp_corrigenda(rfp_id: int, db: Session = Depends(get_db)):
    """Fetches all corrigenda for a specific RFP."""
    corrigenda = db.query(src.models.Corrigendum).filter(src.models.Corrigendum.rfp_id == rfp_id).all()
    return [CorrigendumResponse(
            id=c.id,
            rfp_id=c.id,
            version=c.version,
            change_summary=c.change_summary,
            full_notice=c.full_notice,
            created_at=str(c.created_at)
        ) for c in corrigenda]

@app.get("/rfp/{rfp_id}/versions", response_model=List[RFPVersionResponse])
async def get_rfp_versions(rfp_id: int, db: Session = Depends(get_db)):
    """Fetches all snapshots (versions) for the Time Machine."""
    versions = db.query(src.models.RFPVersion).filter(src.models.RFPVersion.rfp_id == rfp_id).order_by(src.models.RFPVersion.version_number.asc()).all()
    return [RFPVersionResponse(
        id=v.id,
        rfp_id=v.rfp_id,
        version_number=v.version_number,
        content=v.content,
        change_summary=v.change_summary,
        created_at=str(v.created_at)
    ) for v in versions]

@app.get("/rfp/{rfp_id}/version/{version_number}", response_model=RFPVersionResponse)
async def get_specific_rfp_version(rfp_id: int, version_number: int, db: Session = Depends(get_db)):
    """Fetches a specific historical snapshot for the Time Machine."""
    version = db.query(src.models.RFPVersion).filter(
        src.models.RFPVersion.rfp_id == rfp_id,
        src.models.RFPVersion.version_number == version_number
    ).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return RFPVersionResponse(
        id=version.id,
        rfp_id=version.rfp_id,
        version_number=version.version_number,
        content=version.content,
        change_summary=version.change_summary,
        created_at=str(version.created_at)
    )

@app.post("/vendor/query", response_model=VendorQueryResponse)
async def submit_vendor_query(request: VendorQueryRequest, db: Session = Depends(get_db)):
    """
    Submits a vendor query. 
    Returns an AI-generated answer using RAG.
    Ensures the correct RFP version is loaded in the vector store.
    """
    try:
        # 0. Load/Sync correct RFP Index
        rfp = db.query(src.models.RFP).filter(src.models.RFP.id == request.rfp_id).first()
        if not rfp:
            raise HTTPException(status_code=404, detail="RFP not found")

        cache_filename = hashlib.sha256(f"rfp_doc_{request.rfp_id}".encode('utf-8')).hexdigest()
        cache_filepath = os.path.join(app.state.cache_dir, cache_filename)
        
        # Reload index if not already active for this document
        await app.state.vector_store.clear()
        is_cached, _ = await app.state.vector_store.load_index(cache_filepath)
        
        if not is_cached:
            # Fallback: re-index if cache is missing
            document_chunks = [chunk for chunk in app.state.doc_processor._create_chunks_generator(rfp.content)]
            embeddings = await app.state.embedding_engine.generate_embeddings(document_chunks)
            await app.state.vector_store.add_documents(document_chunks, embeddings)
            await app.state.vector_store.save_index(cache_filepath, rfp.content)

        # 1. Deduplication Check (DISABLED to allow fresh answers after Corrigenda)
        query_embedding = await app.state.embedding_engine.generate_query_embedding(request.question)
        
        # 2. RAG Answer Generation
        # Get relevant chunks from the indexed RFP (which includes corrigendum updates)
        relevant_chunks = await app.state.vector_store.search(query_embedding, k=Config.MAX_RELEVANT_CHUNKS)
        
        # Extract intent
        query_intent = app.state.query_processor._extract_query_intent(request.question)
        
        # Generate answer using decision engine
        ai_answer = await app.state.decision_engine.generate_answer(
            request.question, 
            relevant_chunks, 
            query_intent
        )
        
        # 3. Save to database pending approval
        new_query = src.models.Query(
            rfp_id=request.rfp_id,
            question=request.question,
            ai_answer=ai_answer,
            status="pending",
            is_duplicate=False
        )
        db.add(new_query)
        db.commit()
        db.refresh(new_query)
        
        return VendorQueryResponse(
            id=new_query.id,
            question=new_query.question,
            answer="Your query has been submitted and is pending bank approval.",
            status="pending",
            is_duplicate=False
        )
        
    except Exception as e:
        logging.error(f"Error processing vendor query: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")

@app.post("/bank/query/{query_id}/approve", response_model=VendorQueryResponse)
async def approve_vendor_query(query_id: int, request: BankQueryApproveRequest, db: Session = Depends(get_db)):
    """
    Allows a bank official to review the AI-generated answer, edit it if necessary,
    and approve it so it becomes visible to the vendor.
    """
    query = db.query(src.models.Query).filter(src.models.Query.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    query.bank_answer = request.bank_answer
    query.status = "answered"
    db.commit()

    # Record Audit
    record_audit(db, "QUERY_ANSWERED", query.rfp_id, f"Answer provided for question: '{query.question[:50]}...'")
    db.refresh(query)
    
    return VendorQueryResponse(
        id=query.id,
        question=query.question,
        answer=query.bank_answer,
        status=query.status,
        is_duplicate=bool(query.is_duplicate) # Fixed Pydantic validation issue
    )


@app.post("/rfp/draft", response_model=RFPResponse)
async def create_rfp_draft(request: RFPCreateRequest, db: Session = Depends(get_db)):
    """
    Generates a draft RFP based on project details and saves it to the database.
    """
    try:
        # Generate the draft using LLM (returns a list of section objects)
        project_details = request.model_dump()
        structured_sections = await app.state.rfp_generator.generate_draft(project_details)
        
        # Serialize to JSON for storage
        generated_content_json = json.dumps(structured_sections)
        
        # Save to database
        new_rfp = src.models.RFP(
            title=request.title,
            description=request.requirements[:200], # Short summary
            status="draft",
            project_details=project_details,
            content=generated_content_json
        )
        db.add(new_rfp)
        db.commit()
        db.refresh(new_rfp)

        # Save Initial Version (v1.0) for Time Machine
        initial_version = src.models.RFPVersion(
            rfp_id=new_rfp.id,
            version_number=1,
            content=generated_content_json,
            change_summary="Initial Draft Generation"
        )
        db.add(initial_version)
        db.commit()

        # Record Audit
        record_audit(db, "RFP_CREATED", new_rfp.id, f"Draft RFP '{request.title}' initialized by bank officer.", request.bank_profile.contact_email)
        
        # Generate PDF using Jinja2 Template and structured sections
        bank_name = request.bank_profile.bank_name
        app.state.pdf_generator.generate_rfp_pdf(
            new_rfp.id, 
            new_rfp.title, 
            structured_sections, 
            bank_name,
            submission_deadline=request.submission_deadline
        )
        
        return RFPResponse(
            id=new_rfp.id,
            title=new_rfp.title,
            status=new_rfp.status,
            content=generated_content_json,
            pdf_url=f"/static/rfps/rfp_{new_rfp.id}.pdf",
            created_at=str(new_rfp.created_at)
        )
    except Exception as e:
        logging.error(f"Error creating RFP draft: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create RFP draft: {str(e)}")

@app.post("/rfp/publish/{rfp_id}", response_model=RFPResponse)
async def publish_rfp(rfp_id: int, db: Session = Depends(get_db)):
    """
    Publishes an RFP and triggers the document intelligence pipeline (embedding + FAISS).
    """
    rfp = db.query(src.models.RFP).filter(src.models.RFP.id == rfp_id).first()
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP not found")
    
    if rfp.status == "published":
        return RFPResponse(
            id=rfp.id,
            title=rfp.title,
            status=rfp.status,
            content=rfp.content,
            created_at=str(rfp.created_at)
        )

    try:
        # 1. Mark as published in DB
        rfp.status = "published"
        db.commit()

        # Record Audit
        record_audit(db, "RFP_PUBLISHED", rfp_id, f"RFP '{rfp.title}' officially published and live for vendors.")
        
        # 2. Trigger Document Intelligence (RAG Pipeline setup)
        # We'll treat the RFP content as a "document"
        # In a real scenario, we might save it as a PDF/File first, 
        # but here we'll simulate document processing.
        
        # Clear previous vector store data for this simulation or handle it as a new document
        # For simplicity in this demo, we'll process it and add to the current index
        
        # 4. Update RAG Index for Publishing
        try:
            sections = json.loads(rfp.content)
            plain_text_content = ""
            for s in sections:
                plain_text_content += f"{s.get('title')}\n{s.get('executive_summary')}\n"
                for c in s.get('clauses', []):
                    plain_text_content += f"{c.get('heading')} {c.get('content')}\n"
        except:
            plain_text_content = rfp.content
            sections = []

        document_chunks = [chunk for chunk in app.state.doc_processor._create_chunks_generator(plain_text_content)]
        embeddings = await app.state.embedding_engine.generate_embeddings(document_chunks)

        await app.state.vector_store.add_documents(document_chunks, embeddings)

        # Ensure PDF exists with Jinja2 styling
        bank_name = rfp.project_details.get('bank_profile', {}).get('bank_name', 'Institutional Banking')
        submission_deadline = rfp.project_details.get('submission_deadline', 'As per Schedule')
        app.state.pdf_generator.generate_rfp_pdf(rfp.id, rfp.title, sections, bank_name, submission_deadline=submission_deadline)

        logging.info(f"RFP {rfp_id} published and indexed.")
        return RFPResponse(
            id=rfp.id,
            title=rfp.title,
            status=rfp.status,
            content=rfp.content,
            pdf_url=f"/static/rfps/rfp_{rfp.id}.pdf",
            created_at=str(rfp.created_at)
        )
    except Exception as e:
        logging.error(f"Error publishing RFP: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to publish RFP: {str(e)}")

@app.get("/rfps", response_model=List[RFPResponse])
async def list_rfps(db: Session = Depends(get_db)):
    """Lists all RFPs."""
    rfps = db.query(src.models.RFP).order_by(src.models.RFP.id.asc()).all()
    return [RFPResponse(
            id=r.id,
            title=r.title,
            status=r.status,
            content=r.content,
            pdf_url=f"/static/rfps/rfp_{r.id}.pdf",
            created_at=str(r.created_at)
        ) for r in rfps]

@app.get("/rfp/{rfp_id}", response_model=RFPResponse)
async def get_rfp_details(rfp_id: int, db: Session = Depends(get_db)):
    """Gets details for a specific RFP."""
    rfp = db.query(src.models.RFP).filter(src.models.RFP.id == rfp_id).first()
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP not found")
    return RFPResponse(
        id=rfp.id,
        title=rfp.title,
        status=rfp.status,
        content=rfp.content,
        pdf_url=f"/static/rfps/rfp_{rfp.id}.pdf",
        created_at=str(rfp.created_at)
    )

@app.get("/static/rfps/{filename}")
async def get_rfp_pdf_file(filename: str, db: Session = Depends(get_db)):
    """
    Serves the requested RFP PDF. If the PDF does not exist on disk,
    it dynamically generates it on-demand directly from the Supabase DB record.
    """
    static_rfp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generated_rfps")
    file_path = os.path.join(static_rfp_dir, filename)
    
    if os.path.exists(file_path):
        return FileResponse(
            file_path,
            media_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="{filename}"'}
        )
        
    # Extract RFP ID from filename (e.g. rfp_30.pdf -> 30)
    match = re.search(r"rfp_(\d+)\.pdf", filename)
    if match:
        rfp_id = int(match.group(1))
        rfp = db.query(src.models.RFP).filter(src.models.RFP.id == rfp_id).first()
        if rfp:
            try:
                raw_data = json.loads(rfp.content) if isinstance(rfp.content, str) else (rfp.content or [])
                if isinstance(raw_data, dict):
                    sections = raw_data.get("rfp") or raw_data.get("sections") or [raw_data]
                elif isinstance(raw_data, list):
                    sections = raw_data
                else:
                    sections = []
            except Exception:
                sections = [{"title": "RFP Overview", "clauses": [{"heading": "Details", "content": str(rfp.content or "")}]}]
            
            project_details = rfp.project_details or {}
            bank_name = project_details.get('bank_profile', {}).get('bank_name', 'Institutional Banking')
            submission_deadline = project_details.get('submission_deadline', 'As per Schedule')
            
            generated_path = app.state.pdf_generator.generate_rfp_pdf(
                rfp.id, 
                rfp.title, 
                sections, 
                bank_name, 
                submission_deadline=submission_deadline
            )
            if os.path.exists(generated_path):
                return FileResponse(
                    generated_path,
                    media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="{filename}"'}
                )
                
    raise HTTPException(status_code=404, detail="RFP document not found.")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

@app.get("/vendor/queries/{rfp_id}", response_model=List[VendorQueryResponse])
async def get_rfp_queries(rfp_id: int, db: Session = Depends(get_db)):
    """Fetches all APPROVED queries and answers for a specific RFP visible to vendors."""
    queries = db.query(src.models.Query).filter(
        src.models.Query.rfp_id == rfp_id,
        src.models.Query.status == "answered"
    ).all()
    return [VendorQueryResponse(
            id=q.id,
            question=q.question,
            answer=q.bank_answer or q.ai_answer,
            status=q.status,
            is_duplicate=q.is_duplicate
        ) for q in queries]

@app.get("/bank/queries/{rfp_id}", response_model=List[VendorQueryResponse])
async def get_all_rfp_queries(rfp_id: int, db: Session = Depends(get_db)):
    """Fetches ALL queries (pending and answered) for a specific RFP for bank review.
    In a real app, the response model here should likely include the ai_answer as well so the bank sees the draft.
    """
    queries = db.query(src.models.Query).filter(src.models.Query.rfp_id == rfp_id).all()
    
    response = []
    for q in queries:
        ans = q.ai_answer if q.status == "pending" else (q.bank_answer or q.ai_answer)
        response.append(VendorQueryResponse(
            id=q.id,
            question=q.question,
            answer=ans,
            status=q.status,
            is_duplicate=q.is_duplicate
        ))
    return response

@app.post("/hackrx/run", response_model=QueryResponse)
async def run_query(request: QueryRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Processes a document from a URL and answers a list of questions.
    Authenticates requests using a bearer token.
    Includes document validation, caching, embedding generation, and dynamic routing to an agent or RAG pipeline.
    """
    # Authenticate the request with bearer token
    if not credentials or credentials.scheme.lower() != "bearer" or credentials.credentials != Config.BEARER_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing bearer token")
    
    request_start_time = time.time()
    try:
        # Asynchronously log the incoming request details
        asyncio.create_task(app.state.request_logger.log_request(
            document_url=request.documents,
            questions=request.questions
        ))

        # Validate the provided document URL for safety and type
        validation_status, message = await app.state.file_validator.validate_url(request.documents)
        if validation_status in (ValidationStatus.UNSAFE, ValidationStatus.ZIP_ARCHIVE):
            return QueryResponse(answers=[message for _ in request.questions])

        # Generate a unique cache filename from the document URL
        doc_url = request.documents
        cache_filename = hashlib.sha256(doc_url.encode('utf-8')).hexdigest()
        cache_filepath = os.path.join(app.state.cache_dir, cache_filename)

        # Clear previous vector store data and attempt to load from cache
        await app.state.vector_store.clear()
        is_cached, full_document_text = await app.state.vector_store.load_index(cache_filepath)

        if is_cached:
            logging.info(f"Cache HIT for document: {doc_url}")
            document_chunks = app.state.vector_store.documents
            logging.info(f"Extracted text from cache: {full_document_text[:1000]}...") # Log a sample of the cached text
        else:
            logging.info(f"Cache MISS for document: {doc_url}. Processing...")
            # Process document to extract chunks and full text
            document_chunks = [chunk async for chunk in app.state.doc_processor.process_document(doc_url)]
            full_document_text = " ".join([chunk['text'] for chunk in document_chunks])
            logging.info(f"Extracted text: {full_document_text[:1000]}...") # Log a sample of the extracted text

            # Generate embeddings for all chunks at once (no batching)
            start_time_embeddings = time.time()
            embeddings = await app.state.embedding_engine.generate_embeddings(document_chunks)
            await app.state.vector_store.add_documents(document_chunks, embeddings)
            logging.info(f"Embedding generation for {len(document_chunks)} chunks took {time.time() - start_time_embeddings:.2f} seconds.")

            # Save the newly processed index to cache
            await app.state.vector_store.save_index(cache_filepath, full_document_text)
            logging.info(f"Finished processing and cached vector store for document: {doc_url}")

        # Determine if a dynamic agent or standard RAG pipeline is required
        if app.state.file_validator.is_agent_required(full_document_text):
            logging.info("Dynamic document detected. Routing to Mission Agent.")
            
            # Initialize LLM engine for the agent based on API key availability
            mistral_api_key = os.getenv('MISTRAL_API_KEY')
            if not (mistral_api_key and mistral_api_key != 'your-mistral-api-key-here'):
                raise HTTPException(status_code=503, detail="Mistral API key not configured. Mistral LLM is required for dynamic documents.")
            
            logging.info("Using Mistral LLM Engine for agent.")
            from src.mistral_api_llm_engine import MistralApiLLMEngine
            llm_engine_for_agent = MistralApiLLMEngine(app.state.executor)

            # Run the intelligent agent to get answers
            llm_service = LLMInteractionService(llm_engine_for_agent)
            intelligent_agent = IntelligentAgent(llm_service, app.state.query_processor, app.state.decision_engine)
            answer = await intelligent_agent.run(document_chunks, full_document_text)
            answers = [answer] * len(request.questions)
        
        else:
            logging.info("Standard document detected. Using RAG pipeline.")
            # Process queries using the standard RAG pipeline
            answers = await app.state.query_processor.process_queries_parallel(
                request.questions, 
                document_chunks,
                app.state.decision_engine
            )
        
        total_request_time = round((time.time() - request_start_time) * 1000, 2)
        logging.info(f"Request processed successfully in {total_request_time}ms")
        return QueryResponse(answers=answers)
    
    except Exception as e:
        total_request_time = round((time.time() - request_start_time) * 1000, 2)
        logging.error(f"Error processing request: {str(e)} (Request time: {total_request_time}ms)")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.get("/health")
async def health_check():
    """Returns a health status to indicate the service is running."""
    return {"status": "healthy", "service": "query-retrieval-system"}

if __name__ == "__main__":
    # Run the FastAPI application using uvicorn server
    uvicorn.run(app, host="0.0.0.0", port=8000)