"""
auth_routes.py – User registration and login endpoints.
POST /auth/register – Create a new user account
POST /auth/login    – Authenticate and receive a JWT token
"""

from fastapi import APIRouter, HTTPException, status

from app.database import get_users_collection
from app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, MessageResponse
from app.utils.security import hash_password, verify_password
from app.auth import create_access_token
from app.models import UserDocument

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(data: UserRegisterRequest):
    """
    Register a new user.
    - Checks for duplicate email and username
    - Hashes the password with bcrypt
    - Stores the user document in MongoDB
    """
    users_col = get_users_collection()

    # Check if email already registered
    existing_email = await users_col.find_one({"email": data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Check if username taken
    existing_username = await users_col.find_one({"username": data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken. Please choose another.",
        )

    # Hash the password – never store plain text!
    hashed_pw = hash_password(data.password)

    # Build the user document
    user_doc = UserDocument(
        username=data.username,
        email=data.email,
        hashed_password=hashed_pw,
    )

    # Insert into MongoDB
    result = await users_col.insert_one(user_doc.to_dict())

    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account. Please try again.",
        )

    return MessageResponse(
        message=f"Account created successfully! Welcome, {data.username}. Please log in.",
        success=True,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive JWT token",
)
async def login(data: UserLoginRequest):
    """
    Authenticate a user and issue a JWT access token.
    - Checks if email exists
    - Verifies bcrypt password
    - Returns JWT token + user metadata
    """
    users_col = get_users_collection()

    # Find user by email
    user = await users_col.find_one({"email": data.email})
    if not user:
        # Use a generic message to prevent email enumeration attacks
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Verify password
    if not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Check if account is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact support.",
        )

    # Create JWT token with user_id as the subject claim
    user_id = str(user["_id"])
    token = create_access_token(data={"sub": user_id})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user_id,
        username=user["username"],
        email=user["email"],
    )
