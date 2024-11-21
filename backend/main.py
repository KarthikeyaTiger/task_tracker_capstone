from fastapi import FastAPI,Depends,status,HTTPException,Query
from pydantic import BaseModel
from typing import Annotated
import models
from database import engine,SessionLocal
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional


app=FastAPI()
models.Base.metadata.create_all(bind=engine)

class ProjectDetailsCreate(BaseModel):
    project_id: int
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
    task_id: int
    project_id: int
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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]



@app.post("/project",status_code=status.HTTP_201_CREATED)
async def create_project(project:ProjectDetailsCreate,db:db_dependency):
    db_project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project.project_id).first()
    db_employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.id == project.employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if db_project:
        raise HTTPException(status_code=404,detail="project id not unique")
    db_project=models.ProjectDetails(**project.model_dump())
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
    db_task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task.task_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="project not found")
    
    if not db_employee:
        raise HTTPException(status_code=404,detail="employee not found")
    
    if db_task:
        raise HTTPException(status_code=404,detail="Task_id not unique")
    
    db_task=models.TaskDetails(**task.model_dump())
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
async def taskid(task_id:int,db:db_dependency):
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


