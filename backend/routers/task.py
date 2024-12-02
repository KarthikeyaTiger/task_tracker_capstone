# FastAPI related imports
from fastapi import status,Depends, HTTPException,Query,APIRouter

# Database related imports
import models
import schemas
import uuid

# Other imports
from typing import Optional
from routers.project import projectAPI
from dependencies import verify_google_token,db_dependency

class taskAPI:
    def __init__ (self):
        self.router = APIRouter()

        self.router.add_api_route(
            path="/task", endpoint=self.get_tasks, methods=["GET"], status_code=status.HTTP_200_OK
        )

        self.router.add_api_route(
            path="/task/{id}", endpoint=self.get_task_by_id, methods=["GET"], status_code=status.HTTP_200_OK
        )

        self.router.add_api_route(
            path="/task", endpoint=self.create_task, methods=["POST"], status_code=status.HTTP_201_CREATED
        )

        self.router.add_api_route(
            path="/task/{task_id}", endpoint=self.update_task, methods=["PUT"], status_code=status.HTTP_200_OK
        )

        self.router.add_api_route(
            path="/task/{task_id}", endpoint=self.delete_task, methods=["DELETE"], status_code=status.HTTP_200_OK
        )

    async def create_task(self,task_details:schemas.Createtask,db:db_dependency, user: dict = Depends(verify_google_token)):
    # Check if the user is a manager or admin
        manager_ids = await projectAPI.get_projects(db, task_details.task.project_id)
        if user.get('sub') not in manager_ids and user["role"] != "admin":
            raise HTTPException(status_code=403, detail="You are not authorized to create a task")

        # Check if the project exists
        db_project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == task_details.task.project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create the task
        task = task_details.task
        task_id = str(uuid.uuid4())
        db_task = models.TaskDetails(task_id=task_id, **task.model_dump())
        db.add(db_task)
        db.commit()

        # Add employee-task associations
        employee_task_records = [
            models.EmployeeTasksDetails(task_id=task_id, employee_id=employee)
            for employee in task_details.employees
        ]
        db.bulk_save_objects(employee_task_records)

        # Ensure employees are linked to the project if not already
        employee_project_records = []
        for employee in task_details.employees:
            db_emp_project = db.query(models.EmployeeProjectsDetails).filter(
                models.EmployeeProjectsDetails.employee_id == employee,
                models.EmployeeProjectsDetails.project_id == task_details.task.project_id
            ).first()

            if not db_emp_project:
                employee_project_records.append(
                    models.EmployeeProjectsDetails(
                        project_id=task.project_id, employee_id=employee, role="employee"
                    )
                )

        if employee_project_records:
            db.bulk_save_objects(employee_project_records)

        # Commit all changes in one go
        db.commit()

        return {"message": "Task created successfully", "task_id": task_id}
    
    async def get_task_by_id(self,id: str, db: db_dependency, user: dict = Depends(verify_google_token)):
        task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    async def get_tasks(self,db: db_dependency, project_id: Optional[str] = Query(None), employee_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
        query = db.query(models.TaskDetails)

        if project_id:
            query = query.filter(models.TaskDetails.project_id == project_id)

        if employee_id:
            query = query.join(
                models.EmployeeTasksDetails, models.TaskDetails.task_id == models.EmployeeTasksDetails.task_id
            ).filter(models.EmployeeTasksDetails.employee_id == employee_id)

        tasks = query.all()

        if not tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return tasks
    
    async def delete_task(self,task_id:str, db:db_dependency, emp_id=None, user: dict = Depends(verify_google_token)):
        emp_id = emp_id or user.get('sub')
        
        # Get the project_id associated with the task
        project_id = db.query(models.TaskDetails.project_id).filter(models.TaskDetails.task_id == task_id).scalar()

        if not project_id:
            raise HTTPException(status_code=404, detail='Task not found')

        # # Check if the user is a manager or admin for the project
        manager_ids = await projectAPI.get_projects(db, project_id)
        if emp_id not in manager_ids and user["role"] != "admin":
            raise HTTPException(status_code=403, detail="You are not authorized to perform this operation")

        # Delete task employees associations
        db.query(models.EmployeeTasksDetails).filter(models.EmployeeTasksDetails.task_id == task_id).delete()

        # Delete the task itself
        db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).delete()

        db.commit()

        return {"message": "Task deleted successfully"}

    async def update_task(self,task_id:str, task_update:schemas.UpdateTask, db:db_dependency, user: dict = Depends(verify_google_token)):
        # Get the project_id associated with the task
        project_id = db.query(models.TaskDetails.project_id).filter(models.TaskDetails.task_id == task_id).scalar()

        if not project_id:
            raise HTTPException(status_code=404, detail='Task not found')

        # Check if the user is a manager or admin for the project
        manager_ids = await projectAPI.get_projects(db, project_id)
        if user.get('sub') not in manager_ids and user["role"] != "admin":
            raise HTTPException(status_code=403, detail="You are neither a manager nor admin")
        
        # Update task details
        task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Apply the updates to the task
        for key, value in task_update.task.model_dump(exclude_unset=True).items():
            setattr(task, key, value)

        # Update employee-task associations if provided
        if task_update.employees is not None:
            # Delete existing employee-task associations
            db.query(models.EmployeeTasksDetails).filter(models.EmployeeTasksDetails.task_id == task_id).delete()

            # Add new employee-task associations in bulk
            employee_task_records = [
                models.EmployeeTasksDetails(task_id=task_id, employee_id=employee)
                for employee in task_update.employees
            ]
            db.bulk_save_objects(employee_task_records)

        # Commit all changes
        db.commit()

        return {"message": "Task updated successfully"}
