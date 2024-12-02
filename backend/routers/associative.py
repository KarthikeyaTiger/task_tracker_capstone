# FastAPI related imports
from fastapi import status,Depends,HTTPException,Query,APIRouter

# Database related imports
import models

# Other imports
from typing import Optional
from dependencies import verify_google_token,db_dependency

class associativeAPI:
    def __init__(self):
        self.router = APIRouter()

        self.router.add_api_route(
            path="/projects", endpoint=self.get_projects, methods=["GET"], status_code=status.HTTP_200_OK
        )

        self.router.add_api_route(
            path="/tasks", endpoint=self.get_tasks, methods=["GET"], status_code=status.HTTP_200_OK
        )

    async def get_projects(self,db:db_dependency, project_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
        if project_id:
            # Retrieve distinct manager employee IDs for the given project and flatten the result
            result = db.query(models.EmployeeProjectsDetails.employee_id).filter(
                models.EmployeeProjectsDetails.project_id == project_id,
                models.EmployeeProjectsDetails.role == "manager").distinct().all()
            return [employee_id for (employee_id,)  in result]
        
        # Return all employee-project associations if no project_id is provided
        return db.query(models.EmployeeProjectsDetails).all()
    
    async def get_tasks(self,db:db_dependency, task_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
        if task_id:
            result = db.query(models.EmployeeTasksDetails.employee_id).filter(
                models.EmployeeTasksDetails.task_id == task_id
            ).distinct().all()

            return [task_id for (task_id,) in result]

        return db.query(models.EmployeeTasksDetails).all()