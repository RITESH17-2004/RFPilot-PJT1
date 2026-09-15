from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import urllib.parse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the database URL from the environment variable
raw_url = os.getenv("DATABASE_URL")

def create_safe_engine(url_str):
    if not url_str:
        # Fallback for local dev
        return create_engine("sqlite:///./rfp_system.db", connect_args={"check_same_thread": False})
    
    # Ensure we use a compatible driver and handle @ in passwords
    if "postgresql" in url_str:
        # Strip query parameters (like ?pgbouncer=true)
        base_url = url_str.split("?")[0]
        
        try:
            # Handle the case where the password contains '@'
            # Format: protocol://user:password@host:port/dbname
            protocol, rest = base_url.split("://", 1)
            
            # The LAST '@' always separates credentials from the host
            if "@" in rest:
                creds, host_info = rest.rsplit("@", 1)
                if ":" in creds:
                    user, password = creds.split(":", 1)
                    # URL-encode the password to safely handle @, #, etc.
                    safe_password = urllib.parse.quote_plus(password)
                    creds = f"{user}:{safe_password}"
                
                # Reconstruct with the pg8000 driver
                clean_url = f"postgresql+pg8000://{creds}@{host_info}"
                print(">> Connected to Supabase PostgreSQL Database (pg8000)")
                return create_engine(clean_url)
        except Exception as e:
            # Fallback to simple replacement if manual parsing fails
            clean_url = base_url.replace("postgresql://", "postgresql+pg8000://", 1)
            print(">> Connected to Supabase PostgreSQL Database")
            return create_engine(clean_url)
    
    print(">> Connected to Local SQLite Database (rfp_system.db)")
    return create_engine(url_str)

# Create the SQLAlchemy engine
engine = create_safe_engine(raw_url)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our database models
Base = declarative_base()

def get_db():
    """
    Dependency to get a database session.
    Ensures that the session is closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
