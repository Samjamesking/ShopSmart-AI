import json
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserOut, Token, UserPreferencesUpdate
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user, parse_user_preferences
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    hashed = get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        password=hashed,
        role="user",
        preferences=json.dumps({"favorite_brands": [], "budget_range": {}, "categories": [], "dark_mode": False, "currency": "INR"})
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "preferences": parse_user_preferences(user),
            "created_at": user.created_at
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "preferences": parse_user_preferences(user),
            "created_at": user.created_at
        }
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "preferences": parse_user_preferences(current_user),
        "created_at": current_user.created_at
    }

@router.put("/preferences")
def update_preferences(pref_in: UserPreferencesUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_pref = parse_user_preferences(current_user)
    if pref_in.favorite_brands is not None:
        existing_pref["favorite_brands"] = pref_in.favorite_brands
    if pref_in.budget_range is not None:
        existing_pref["budget_range"] = pref_in.budget_range
    if pref_in.categories is not None:
        existing_pref["categories"] = pref_in.categories
    if pref_in.dark_mode is not None:
        existing_pref["dark_mode"] = pref_in.dark_mode
    if pref_in.currency is not None:
        existing_pref["currency"] = pref_in.currency

    current_user.preferences = json.dumps(existing_pref)
    db.commit()
    return {"message": "Preferences updated successfully", "preferences": existing_pref}
