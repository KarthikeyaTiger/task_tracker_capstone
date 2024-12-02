# FastAPI related imports
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

# Database related imports
import models
from database import engine,SessionLocal
from sqlalchemy.orm import Session

# Other imports
from typing import Annotated
import requests


models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_google_token(db: db_dependency, token: str = Depends(oauth2_scheme)):
    # Verify Google token
    response = requests.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={token}")
    # if response.status_code != 200:
    #     raise HTTPException(status_code=401, detail="Invalid Google access token")
    
    # Parse user info
    user_info = response.json()
    employee_id = user_info.get('sub')
    if not employee_id:
        raise HTTPException(status_code=400, detail="Invalid token: Missing employee ID")

    # Fetch role from the database
    db_role = db.query(models.EmployeeDetails.role).filter_by(employee_id=employee_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Add role to user info
    user_info["role"] = db_role[0]

    return user_info