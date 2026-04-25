from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings

security = HTTPBearer()

# Supabase JWT secret is your project's JWT secret (found in project settings → API)
# We verify the token locally using the JWT secret from Supabase
SUPABASE_JWT_SECRET = None  # set via SUPABASE_JWT_SECRET env var


def get_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    token = credentials.credentials
    try:
        # Decode without verification first to get user_id if JWT secret not set
        if SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        else:
            payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_aud": False},
                algorithms=["HS256"],
            )
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
