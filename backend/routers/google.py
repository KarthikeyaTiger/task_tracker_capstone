# FastAPI related imports
from fastapi import status,HTTPException, Query,APIRouter

# Database related imports
import models
import schemas

# Other imports
import requests

from dependencies import db_dependency

class googleAPI:
    def __init__(self):
        self.router = APIRouter()

        self.router.add_api_route(
            path="/auth/google", endpoint=self.authenticate_google_user, methods=["POST"], status_code=status.HTTP_200_OK
        )

    async def authenticate_google_user(self,request: schemas.GoogleLoginRequest,db:db_dependency):
        # print("google authentication")
        response = requests.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={request.token}"
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        # Parse the user data from the response
        user_info = response.json()

        user_data = {
            "employee_id": user_info["sub"],
            "name": user_info.get("name"),
            "email_id": user_info.get("email"),
            "picture": user_info.get("picture"),
            "role":"user"
        }

        # Check if the employee already exists
        existing_employee = db.query(models.EmployeeDetails).get(user_data["employee_id"])

        if existing_employee:
            return existing_employee
        else:
            db_employee = models.EmployeeDetails(**user_data)
            db.add(db_employee)
            db.commit()
            return user_data