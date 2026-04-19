"""
main.py – FastAPI application entry point.
This file wires together all routers, middleware, and lifecycle events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import connect_db, close_db
from app.routes import auth_routes, prediction_routes, history_routes, admin_routes
from app.ml.model_loader import load_model
from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def init_superuser():
    """Reads .env to initialize the first admin user automatically."""
    email = os.getenv("FIRST_SUPERUSER_EMAIL")
    password = os.getenv("FIRST_SUPERUSER_PASSWORD")
    
    if not email or not password:
        return
        
    from app.database import get_users_collection
    from app.utils.security import hash_password
    from app.models import UserDocument
    
    users_col = get_users_collection()
    existing_user = await users_col.find_one({"email": email})
    
    if existing_user:
        if existing_user.get("role") != "admin":
            await users_col.update_one(
                {"_id": existing_user["_id"]},
                {"$set": {"role": "admin"}}
            )
            print(f"✅ Upgraded existing user {email} to admin role.")
        return
        
    print(f"🚀 Creating first superuser: {email}")
    hashed_pw = hash_password(password)
    username = email.split("@")[0] # fallback username
    user_doc = UserDocument(username=username, email=email, hashed_password=hashed_pw, role="admin")
    await users_col.insert_one(user_doc.to_dict())
    print("✅ First superuser created successfully.")

# ─── Application Lifecycle ────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager.
    Code before yield runs on startup, code after yield runs on shutdown.
    """
    # STARTUP
    print("🚀 Starting BrainTumor API...")

    # Connect to MongoDB
    await connect_db()
    
    # Initialize superuser if configured
    await init_superuser()

    # Load CNN model (or enter demo mode)
    load_model()

    print("✅ BrainTumor API is ready.")

    yield  # Application runs here

    # SHUTDOWN
    print("🛑 Shutting down BrainTumor API...")
    await close_db()


# ─── App Instance ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="BrainTumor API",
    description=(
        "AI-powered brain tumor detection system. "
        "Upload MRI scans and receive instant predictions using a CNN model."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ─── CORS Middleware ──────────────────────────────────────────────────────────
# allow_origins=["*"] allows any frontend origin during development.
# We set allow_credentials=False so we can use ["*"] — this is fine because
# JWT is sent in the Authorization header, NOT as a cookie.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Static Files (Uploaded Images) ───────────────────────────────────────────
# Serves uploaded MRI images at /uploads/<user_id>/<filename>
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth_routes.router)
app.include_router(prediction_routes.router)
app.include_router(history_routes.router)
app.include_router(admin_routes.router)


# ─── Root Endpoint ────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "BrainTumor AI API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "message": "BrainTumor API is running."}
