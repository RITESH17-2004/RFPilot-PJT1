from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database import Base

class User(Base):
    """
    User model for authentication and role management.
    Roles: 'bank', 'vendor'
    Status: 'pending', 'approved', 'rejected'
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)  # 'bank' or 'vendor'
    status = Column(String, default="pending") # 'pending', 'approved', 'rejected'
    
    # Vendor-specific fields
    organization = Column(String, nullable=True)
    registration_id = Column(String, nullable=True)
    website = Column(String, nullable=True)
    vendor_category = Column(String, nullable=True)
    years_in_business = Column(Integer, nullable=True)
    contact_phone = Column(String, nullable=True)

    # Relationships defined using strings to avoid circular dependency issues
    rfps = relationship("RFP", back_populates="creator")
    queries = relationship("Query", back_populates="vendor")

class Query(Base):
    """
    Vendor queries and their AI/Bank-approved answers.
    """
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, index=True)
    rfp_id = Column(Integer, ForeignKey("rfps.id"))
    vendor_id = Column(Integer, ForeignKey("users.id"))
    
    question = Column(Text, nullable=False)
    ai_answer = Column(Text, nullable=True)
    bank_answer = Column(Text, nullable=True)
    
    status = Column(String, default="pending")  # 'pending', 'answered', 'rejected'
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(Integer, ForeignKey("queries.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    rfp = relationship("RFP", back_populates="queries")
    vendor = relationship("User", back_populates="queries")

class Corrigendum(Base):
    """
    Stores change notices for an RFP.
    """
    __tablename__ = "corrigenda"

    id = Column(Integer, primary_key=True, index=True)
    rfp_id = Column(Integer, ForeignKey("rfps.id"))
    
    version = Column(Integer, nullable=False)
    change_summary = Column(Text, nullable=False)
    full_notice = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    rfp = relationship("RFP", back_populates="corrigenda")

class RFPVersion(Base):
    """
    Stores full snapshots of RFP content for the Time Machine.
    """
    __tablename__ = "rfp_versions"

    id = Column(Integer, primary_key=True, index=True)
    rfp_id = Column(Integer, ForeignKey("rfps.id"))
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False) # JSON snapshot
    change_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    rfp = relationship("RFP", back_populates="versions")

class RFP(Base):
    """
    Master RFP model. Defined last to ensure all related classes exist for relationships.
    """
    __tablename__ = "rfps"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="draft")
    
    project_details = Column(JSON, nullable=True)
    content = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="rfps")
    
    queries = relationship("Query", back_populates="rfp")
    corrigenda = relationship("Corrigendum", back_populates="rfp")
    versions = relationship("RFPVersion", back_populates="rfp")

class AuditLog(Base):
    """
    Tracks all major system events with Cryptographic Chaining.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    rfp_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    actor = Column(String, nullable=True)
    
    previous_hash = Column(String, nullable=True)
    hash = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
