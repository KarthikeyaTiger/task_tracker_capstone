# FastAPI related imports
from fastapi import status,Depends,HTTPException, Query,APIRouter

# Database related imports
import models
import schemas
import uuid

# Other imports
from typing import Optional
from routers.task import taskAPI
from dependencies import verify_google_token,db_dependency


class projectAPI:
    def __init__ (self):
        self.router = APIRouter()

        self.router.add_api_route(
            path="/project", endpoint=self.get_projects, methods=["GET"], status_code=status.HTTP_200_OK
        )

        self.router.add_api_route(
            path="/project/{id}", endpoint=self.get_project_by_id, methods=["GET"], status_code=status.HTTP_200_OK
        )

        self.router.add_api_route(
            path="/project", endpoint=self.create_project, methods=["POST"], status_code=status.HTTP_201_CREATED
        )

        self.router.add_api_route(
            path="/project/{project_id}", endpoint=self.update_project, methods=["PUT"], status_code=status.HTTP_200_OK
        )

        self.router.add_api_route(
            path="/project/{project_id}", endpoint=self.delete_project, methods=["DELETE"], status_code=status.HTTP_200_OK
        )

    async def get_projects(self,db: db_dependency, employee_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
            if employee_id:
                # Validate employee existence
                employee_exists = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.employee_id == employee_id).first()
                if not employee_exists:
                    raise HTTPException(status_code=404, detail="Employee not found")

                # Fetch projects for the employee using a join
                projects = (
                    db.query(models.ProjectDetails)
                    .join(models.EmployeeProjectsDetails, models.ProjectDetails.project_id == models.EmployeeProjectsDetails.project_id)
                    .filter(models.EmployeeProjectsDetails.employee_id == employee_id)
                    .all()
                )
                if not projects:
                    raise HTTPException(status_code=404, detail="No projects found for this employee")

            else:
                # Fetch all projects
                projects = db.query(models.ProjectDetails).all()
                if not projects:
                    raise HTTPException(status_code=404, detail="No projects available")

            return projects

    async def get_project_by_id(self, id: str, db: db_dependency , user: dict = Depends(verify_google_token)):
            # Fetch the project by ID
            project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == id).first()
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")
            
            return project
        
    async def create_project(self,project_details: schemas.CreateProject, db: db_dependency, user: dict = Depends(verify_google_token)):
            # Check admin privileges
            if user["role"] != "admin":
                raise HTTPException(status_code=403, detail="You are not authorized to create projects")

            # Create project
            project_id = str(uuid.uuid4())
            project = models.ProjectDetails(project_id=project_id, **project_details.project.model_dump())
            db.add(project)

            # Assign employees to the project
            employee_projects = [
                models.EmployeeProjectsDetails(project_id=project_id, employee_id=employee, role="manager")
                for employee in project_details.employees
            ]
            db.add_all(employee_projects)

            # Commit the transaction
            db.commit()

            return {"message": "Project created successfully", "project_id": project_id}
        
    async def update_project(self,project_id: str, project_update: schemas.UpdateProject, db: db_dependency, user: dict = Depends(verify_google_token)):
            # Check admin privileges
            if user["role"] != "admin":
                raise HTTPException(status_code=403, detail="You are not authorized to update projects")

            # Fetch the project
            project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project_id).first()
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")

            # Update project details
            updated_fields = project_update.project.model_dump(exclude_unset=True)
            for key, value in updated_fields.items():
                setattr(project, key, value)
            db.commit()
            
            if project_update.employees:
                # Delete existing employee-project associations
                db.query(models.EmployeeProjectsDetails).filter(
                    models.EmployeeProjectsDetails.project_id == project_id
                ).delete()
                db.commit()

                # Add new employee-project associations
                employee_project_records = [
                    models.EmployeeProjectsDetails(project_id=project_id, employee_id=employee, role="manager")
                    for employee in project_update.employees
                ]
                db.bulk_save_objects(employee_project_records)
                db.commit()
            
            return {
                "message": "Project updated successfully",
            }
        
    async def delete_project(self,project_id:str,db:db_dependency, user: dict = Depends(verify_google_token)):
            # Check admin privileges
            if user["role"] != "admin":
                raise HTTPException(status_code=403, detail="You are not authorized to delete projects")

            # Check if the project exists
            project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project_id).first()
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")

            # Delete associated tasks
            tasks = db.query(models.TaskDetails).filter(models.TaskDetails.project_id == project_id).all()
            for task in tasks:
                await taskAPI.delete_task(self,task.task_id, db, emp_id=user.get('sub'),user=user)  # Assuming `delete_task` is asynchronous

            # Delete employee-project associations in bulk
            db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.project_id == project_id).delete()

            # Delete the project
            db.delete(project)
            db.commit()

            return {"message": "Project deleted successfully"}