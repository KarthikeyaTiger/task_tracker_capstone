from fastapi import FastAPI,Depends,status,HTTPException,Query
from pydantic import BaseModel
from typing import Annotated
import models
from database import engine,SessionLocal
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional,List
from fastapi.middleware.cors import CORSMiddleware
import uuid


app=FastAPI()
models.Base.metadata.create_all(bind=engine)


origins = [
    "http://localhost:5173",  # React development server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows only your React app to access the FastAPI backend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

class ProjectDetailsCreate(BaseModel):
    employee_id: int  
    title: str
    description: str
    startdate: date
    enddate: date
    project_status: str
    class Config:
        orm_mode = True 

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    startdate: Optional[date] = None
    enddate: Optional[date] = None
    project_status: Optional[str] = None

class TaskDetailsCreate(BaseModel):
    project_id: str
    employee_id: int
    title: str
    description: str
    startdate: date
    enddate: date
    task_status: str
    class Config:
        orm_mode = True 

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    startdate: Optional[date] = None
    enddate: Optional[date] = None
    task_status: Optional[str] = None

class TaskDetailsResponse(BaseModel):
    employee_id: int
    project_id: str
    task_id: str
    title: str
    
    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]



@app.post("/project",status_code=status.HTTP_201_CREATED)
async def create_project(project:ProjectDetailsCreate,db:db_dependency):
    # db_project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project.project_id).first()
    db_employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.id == project.employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    # if db_project:
    #     raise HTTPException(status_code=404,detail="project id not unique")
    project_id = str(uuid.uuid4())
    db_project=models.ProjectDetails(project_id=project_id,**project.model_dump())
    db.add(db_project)
    db.commit()


{
# @app.get('/project/{project_id}',status_code=status.HTTP_200_OK)
# async def projectid(project_id:int,db:db_dependency):
#     print(project_id)
#     project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project_id).first()
#     if project is None:
#         return HTTPException(status_code=404, detail='Project Not found')
#     return project

# @app.get('/project',status_code=status.HTTP_200_OK)
# async def all_project(db:db_dependency):
#     project = db.query(models.ProjectDetails).all()
#     if project is None:
#         return HTTPException(status_code=404, detail="No project's found")
#     return project

}

@app.get('/project', status_code=status.HTTP_200_OK)
@app.get('/project/{id}', status_code=status.HTTP_200_OK)
async def get_task(db: db_dependency, id: Optional[int] = None, employee_id: Optional[int] = Query(None)):
    query = db.query(models.ProjectDetails)
    
    if id:
        query = query.filter(models.ProjectDetails.project_id == id)
    if employee_id:
        query = query.filter(models.ProjectDetails.employee_id == employee_id)
    
    task = query.first() if id else query.all()
    
    if not task:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return task


@app.delete('/project/{project_id}',status_code=status.HTTP_200_OK)
async def delete_project(project_id:int,db:db_dependency):
    print("project_delete")

    tasks = db.query(models.TaskDetails).filter(models.TaskDetails.project_id == project_id)

    for task in tasks:
        print(task.task_id)
        await delete_task(task.task_id,db)

    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project_id).first()
    if project is None:
        return HTTPException(status_code=404, detail='Project Not found')
    db.delete(project)
    db.commit()


@app.put('/project/{project_id}', status_code=status.HTTP_200_OK)
async def update_project(project_id: int, project_update: ProjectUpdate, db: db_dependency):
    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in project_update.model_dump(exclude_unset=True).items():
        setattr(project, key, value) 
    
    db.commit() 




# ________________________________________________________________________________________________________





@app.post('/task',status_code=status.HTTP_201_CREATED)
async def create_task(task:TaskDetailsCreate,db:db_dependency):
    db_employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.id == task.employee_id).first()
    db_project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == task.project_id).first()
    # db_task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task.task_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="project not found")
    
    if not db_employee:
        raise HTTPException(status_code=404,detail="employee not found")
    
    # if db_task:
    #     raise HTTPException(status_code=404,detail="Task_id not unique")
    task_id=str(uuid.uuid4())
    db_task=models.TaskDetails(task_id=task_id,**task.model_dump())
    db.add(db_task)
    db.commit()


{
# @app.get('/task/{task_id}',status_code=status.HTTP_200_OK)
# async def taskid(task_id:int,db:db_dependency):
#     task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).first()
#     if task is None:
#         return HTTPException(status_code=404, detail='task Not found')
#     return task

# @app.get('/task',status_code=status.HTTP_200_OK)
# async def all_task(db:db_dependency):
#     task = db.query(models.TaskDetails).all()
#     if task is None:
#         return HTTPException(status_code=404, detail="No tasks's Not found")
#     return task
}


@app.get('/task', status_code=status.HTTP_200_OK)
@app.get('/task/{id}', status_code=status.HTTP_200_OK)
async def get_task(db: db_dependency, id: Optional[int] = None, employee_id: Optional[int] = Query(None), project_id: Optional[int] = Query(None)):
    query = db.query(models.TaskDetails)
    
    if id:
        query = query.filter(models.TaskDetails.task_id == id)
    if employee_id:
        query = query.filter(models.TaskDetails.employee_id == employee_id)
    if project_id:
        query = query.filter(models.TaskDetails.project_id == project_id)
    
    task = query.first() if id else query.all()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task


@app.delete('/task/{task_id}',status_code=status.HTTP_200_OK)
async def delete_task(task_id:int,db:db_dependency):
    print("delete_task")
    task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).first()
    if task is None:
        return HTTPException(status_code=404, detail='task Not found')
    db.delete(task)
    db.commit()

@app.put('/task/{task_id}',status_code=status.HTTP_200_OK)
async def taskid(task_id:int,task_update:TaskUpdate,db:db_dependency):
    task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).first()
    if task is None:
        return HTTPException(status_code=404, detail='task Not found')
    for key, value in task_update.model_dump(exclude_unset=True).items():
        setattr(task, key, value) 
    db.commit()

@app.get('/employee/tasks/{id}',status_code=status.HTTP_200_OK,response_model=List[TaskDetailsResponse])
async def emplyee_tasks(id:int,db:db_dependency):
    print("employee_tasks")
    db_employee = db.query(models.TaskDetails).filter(models.TaskDetails.employee_id == id).first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee does not have any tasks")
    # employee_project = db.query(models.TaskDetails).\
    #                     filter(models.TaskDetails.employee_id == id).\
    #                     group_by(models.TaskDetails.employee_id,models.TaskDetails.project_id).all()
    employee_project = db.query(
        models.TaskDetails.employee_id,
        models.TaskDetails.project_id,
        models.TaskDetails.task_id,models.ProjectDetails.title
    ).join(
        models.ProjectDetails,  # Join the project_details table
        models.TaskDetails.project_id == models.ProjectDetails.project_id  # On project_id
    ).filter(
        models.TaskDetails.employee_id == id
    ).all()

    for emp in employee_project:
        print(emp.project_id)

    return employee_project
