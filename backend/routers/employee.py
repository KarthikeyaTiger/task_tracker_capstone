# FastAPI related imports
from fastapi import status,Depends,HTTPException,Query,APIRouter

# Database related imports
import models

# Other imports
from dependencies import verify_google_token,db_dependency

class employeeAPI:
    def __init__(self):
        self.router = APIRouter()

        self.router.add_api_route(
            path="/employee", endpoint=self.get_employees, methods=["GET"], status_code=status.HTTP_200_OK
        )

        self.router.add_api_route(
            path="/employee/{employee_id}", endpoint=self.get_employee_by_id, methods=["GET"], status_code=status.HTTP_200_OK
        )
    
    async def get_employees(self,db: db_dependency, user: dict = Depends(verify_google_token)):
        return db.query(models.EmployeeDetails).all()
    
    async def get_employee_by_id(self,employee_id: int, db: db_dependency, user: dict = Depends(verify_google_token) ):
        # Retrieve a specific employee by ID
        employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.employee_id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee