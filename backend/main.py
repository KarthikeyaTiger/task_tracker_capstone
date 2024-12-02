# FastAPI related imports
from fastapi import FastAPI, Depends, status, HTTPException, Query
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

# Database related imports
import models
import schemas
import uuid
from database import engine,SessionLocal
from sqlalchemy.orm import Session

# Other imports
from typing import Annotated, Dict, Optional
import requests

app=FastAPI()
models.Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# Verification of google token
def verify_google_token(db: db_dependency, token: str = Depends(oauth2_scheme)):
    # Verify Google token
    response = requests.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={token}")
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google access token")
    
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

# Index Endpoint ________________________________________________________________________________________________________

@app.get("/")
def index():
    return {
        "data": "Hello World!"
    }

# Project Endpoints ________________________________________________________________________________________________________

@app.get('/project', status_code=status.HTTP_200_OK)
async def get_projects( db: db_dependency, employee_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token) ):
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

@app.get('/project/{id}', status_code=status.HTTP_200_OK)
async def get_project_by_id( id: str, db: db_dependency, user: dict = Depends(verify_google_token) ):
    # Fetch the project by ID
    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project

@app.post("/project", status_code=status.HTTP_201_CREATED)
async def create_project(project_details: schemas.CreateProject, db: db_dependency, user: dict = Depends(verify_google_token)):
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

@app.put('/project/{project_id}', status_code=status.HTTP_200_OK)
async def update_project(project_id: str, project_update: schemas.UpdateProject, db: db_dependency,user: dict = Depends(verify_google_token)):
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

@app.delete('/project/{project_id}',status_code=status.HTTP_200_OK)
async def delete_project(project_id:str,db:db_dependency,user: dict = Depends(verify_google_token)):
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
        await delete_task(task.task_id, db, emp_id=user.get('sub'))  # Assuming `delete_task` is asynchronous

    # Delete employee-project associations in bulk
    db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.project_id == project_id).delete()

    # Delete the project
    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}


# Task Endpoints ________________________________________________________________________________________________________

@app.post('/task',status_code=status.HTTP_201_CREATED)
async def create_task(task_details:schemas.Createtask,db:db_dependency, user: dict = Depends(verify_google_token)):
    # Check if the user is a manager or admin
    manager_ids = await get_projects(db, task_details.task.project_id)
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

@app.get('/task/{id}', status_code=status.HTTP_200_OK)
async def get_task_by_id(id: str, db: db_dependency, user: dict = Depends(verify_google_token)):
    task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.get('/task', status_code=status.HTTP_200_OK)
async def get_tasks(db: db_dependency, project_id: Optional[str] = Query(None), employee_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
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

@app.delete('/task/{task_id}',status_code=status.HTTP_200_OK)
async def delete_task(task_id:str, db:db_dependency, emp_id=None, user: dict = Depends(verify_google_token)):
    emp_id = emp_id or user.get('sub')
    
    # Get the project_id associated with the task
    project_id = db.query(models.TaskDetails.project_id).filter(models.TaskDetails.task_id == task_id).scalar()

    if not project_id:
        raise HTTPException(status_code=404, detail='Task not found')

    # Check if the user is a manager or admin for the project
    manager_ids = await get_projects(db, project_id)
    if emp_id not in manager_ids and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You are not authorized to perform this operation")

    # Delete task employees associations
    db.query(models.EmployeeTasksDetails).filter(models.EmployeeTasksDetails.task_id == task_id).delete()

    # Delete the task itself
    db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).delete()

    db.commit()

    return {"message": "Task deleted successfully"}

@app.put('/task/{task_id}',status_code=status.HTTP_200_OK)
async def update_task(task_id:str, task_update:schemas.UpdateTask, db:db_dependency, user: dict = Depends(verify_google_token)):
    # Get the project_id associated with the task
    project_id = db.query(models.TaskDetails.project_id).filter(models.TaskDetails.task_id == task_id).scalar()

    if not project_id:
        raise HTTPException(status_code=404, detail='Task not found')

    # Check if the user is a manager or admin for the project
    manager_ids = await get_projects(db, project_id)
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


# Employee Endpoints _______________________________________________________________________________________________________

@app.get("/employee",status_code=status.HTTP_200_OK)
async def get_employees(db: db_dependency, user: dict = Depends(verify_google_token)):
    return db.query(models.EmployeeDetails).all()


@app.get("/employee/{employee_id}",status_code=status.HTTP_200_OK)
async def get_employee_by_id(employee_id: int, db: db_dependency, user: dict = Depends(verify_google_token) ):
    # Retrieve a specific employee by ID
    employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


# Associative Tables Endpoints __________________________________________________________________________________________

@app.get("/projects",status_code=status.HTTP_200_OK)
async def get_projects(db:db_dependency, project_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
    if project_id:
        # Retrieve distinct manager employee IDs for the given project and flatten the result
        result = db.query(models.EmployeeProjectsDetails.employee_id).filter(
            models.EmployeeProjectsDetails.project_id == project_id,
            models.EmployeeProjectsDetails.role == "manager").distinct().all()
        return [employee_id for (employee_id,)  in result]
    
    # Return all employee-project associations if no project_id is provided
    return db.query(models.EmployeeProjectsDetails).all()

@app.get("/tasks",status_code=status.HTTP_200_OK)
async def get_tasks(db:db_dependency, task_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
    if task_id:
        result = db.query(models.EmployeeTasksDetails.employee_id).filter(
            models.EmployeeTasksDetails.task_id == task_id
        ).distinct().all()

        return [task_id for (task_id,) in result]

    return db.query(models.EmployeeTasksDetails).all()


# Google Login / Sign up Endpoint ________________________________________________________________________________________________

@app.post("/auth/google")
async def authenticate_google_user(request: schemas.GoogleLoginRequest,db:db_dependency):
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