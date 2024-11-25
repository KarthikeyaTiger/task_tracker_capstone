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
    title: str
    description: str
    startdate: date
    enddate: date
    project_status: str
    class Config:
        orm_mode = True 

class CreateProject(BaseModel):
    project: ProjectDetailsCreate
    employees: List[str]

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    startdate: Optional[date] = None
    enddate: Optional[date] = None
    project_status: Optional[str] = None

class UpdateProject(BaseModel):
    project: ProjectUpdate
    employee_id: Optional[List[str]] = None

class TaskDetailsCreate(BaseModel):
    project_id: str
    title: str
    description: str
    startdate: date
    enddate: date
    task_status: str
    class Config:
        orm_mode = True 

class Createtask(BaseModel):
    task: TaskDetailsCreate
    employees: List[str]

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    startdate: Optional[date] = None
    enddate: Optional[date] = None
    task_status: Optional[str] = None

class UpdateTask(BaseModel):
    task: TaskUpdate
    employee_id: List[str]

{
# class TaskDetailsResponse(BaseModel):
#     employee_id: int
#     project_id: str
#     task_id: str
#     title: str
    
#     class Config:
#         orm_mode = True
}

class EmployeeProjectDetails(BaseModel):
    project_id: str
    employee_id: str
    role: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]



@app.post("/project",status_code=status.HTTP_201_CREATED)
async def create_project(project_details:CreateProject,db:db_dependency):
    # db_project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project.project_id).first()
    # db_employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.id == project.employee_id).first()
    # if not db_employee:
    #     raise HTTPException(status_code=404, detail="Employee not found")
    # if db_project:
    #     raise HTTPException(status_code=404,detail="project id not unique")
    project = project_details.project
    project_id = str(uuid.uuid4())
    db_project=models.ProjectDetails(project_id=project_id,**project.model_dump())
    db.add(db_project)
    db.commit()
    for employee in project_details.employees:
        print(employee)
        db_employeeproject =  models.EmployeeProjectsDetails(project_id=project_id,employee_id=employee)
        db.add(db_employeeproject)
        db.commit()
    print("end")


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

@app.get('/project/{id}', status_code=status.HTTP_200_OK)
async def projectid(db:db_dependency,id:str):
    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == id).first()
    if project is None:
        return HTTPException(status_code=404, detail="No project's found")
    return project


@app.get('/project', status_code=status.HTTP_200_OK)
async def get_project(db: db_dependency, employee_id: Optional[str] = Query(None)):

    projects=[]
    if employee_id:
        print("employee_id")
        employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.employee_id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        project_list = db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.employee_id == employee_id).all()
        print(project_list)
        for pro in project_list:
            print(pro)
            project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == pro.project_id).first()
            print(project)
            projects.append(project)
    else:
        project=db.query(models.ProjectDetails).all()
        return project
    
    return projects


@app.delete('/project/{project_id}',status_code=status.HTTP_200_OK)
async def delete_project(project_id:str,db:db_dependency):
    print("project_delete")

    tasks = db.query(models.TaskDetails).filter(models.TaskDetails.project_id == project_id)

    for task in tasks:
        print(task.task_id)
        await delete_task(task.task_id,db)

    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project_id).first()
    projectemp = db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.project_id == project_id).all()
    for pro in projectemp:
        db.delete(pro)
        db.commit()
    if project is None:
        return HTTPException(status_code=404, detail='Project Not found')
    db.delete(project)
    db.commit()


@app.put('/project/{project_id}', status_code=status.HTTP_200_OK)
async def update_project(project_id: str, project_update: UpdateProject, db: db_dependency):
    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in project_update.project.model_dump(exclude_unset=True).items():
        setattr(project, key, value) 
    
    db.commit() 

    projectemployee = db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.project_id == project_id).all()
    
    for pro in projectemployee:
        db.delete(pro)
        db.commit()

    for employee in project_update.employee_id:
        db_projectemployee=models.EmployeeProjectsDetails(project_id=project_id,employee_id=employee)
        db.add(db_projectemployee)
        db.commit()




# ________________________________________________________________________________________________________





@app.post('/task',status_code=status.HTTP_201_CREATED)
async def create_task(task_details:Createtask,db:db_dependency):
    # db_employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.id == task.employee_id).first()
    db_project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == task_details.task.project_id).first()
    # db_task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task.task_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="project not found")
    
    # if not db_employee:
    #     raise HTTPException(status_code=404,detail="employee not found")
    
    # if db_task:
    #     raise HTTPException(status_code=404,detail="Task_id not unique")
    task=task_details.task
    task_id=str(uuid.uuid4())
    db_task=models.TaskDetails(task_id=task_id,**task.model_dump())
    db.add(db_task)
    db.commit()

    for employee in task_details.employees:
        print(employee)
        db_employeetask = models.EmployeeTasksDetails(task_id=task_id,employee_id=employee)
        db.add(db_employeetask)
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


@app.get('/task/{id}', status_code=status.HTTP_200_OK)
async def all_task(db:db_dependency,id:str):
    task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == id).first()
    if task is None:
        return HTTPException(status_code=404, detail="No tasks's Not found")
    return task


@app.get('/task', status_code=status.HTTP_200_OK)
async def get_task(db: db_dependency,project_id: Optional[str] = Query(None), employee_id: Optional[str] = Query(None)):
    tasks=[]
    if project_id and employee_id:
        projects=db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.employee_id == employee_id).all()
        # print(tasks)
        for project in projects:
            task = db.query(models.TaskDetails).filter(models.TaskDetails.project_id == project.project_id).first()
            tasks.append(task)
    elif project_id:
        print("project_id")
        tasks = db.query(models.TaskDetails).filter(models.TaskDetails.project_id == project_id).first()
    else:
        tasks=db.query(models.TaskDetails).all()
    print("sjvh")
    if not tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return tasks


@app.delete('/task/{task_id}',status_code=status.HTTP_200_OK)
async def delete_task(task_id:str,db:db_dependency):
    print("delete_task")
    task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).first()
    task_employee = db.query(models.EmployeeTasksDetails).filter(models.EmployeeTasksDetails.task_id == task_id).all()
    if task is None:
        return HTTPException(status_code=404, detail='task Not found')
    for t in task_employee:
        db.delete(t)
        db.commit()
    db.delete(task)
    db.commit()

@app.put('/task/{task_id}',status_code=status.HTTP_200_OK)
async def taskid(task_id:str,task_update:UpdateTask,db:db_dependency):
    task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).first()
    if task is None:
        return HTTPException(status_code=404, detail='task Not found')
    for key, value in task_update.task.model_dump(exclude_unset=True).items():
        setattr(task, key, value) 
    db.commit()

    taskemployee = db.query(models.EmployeeTasksDetails).filter(models.EmployeeTasksDetails.task_id == task_id).all()
    
    for task in taskemployee:
        db.delete(task)
        db.commit()

    for employee in task_update.employee_id:
        db_projectemployee=models.EmployeeTasksDetails(task_id=task_id,employee_id=employee)
        db.add(db_projectemployee)
        db.commit()




{
# @app.get('/employee/tasks/{id}',status_code=status.HTTP_200_OK,response_model=List[TaskDetailsResponse])
# async def emplyee_tasks(id:int,db:db_dependency):
#     print("employee_tasks")
#     db_employee = db.query(models.TaskDetails).filter(models.TaskDetails.employee_id == id).first()
#     if db_employee is None:
#         raise HTTPException(status_code=404, detail="Employee does not have any tasks")
#     # employee_project = db.query(models.TaskDetails).\
#     #                     filter(models.TaskDetails.employee_id == id).\
#     #                     group_by(models.TaskDetails.employee_id,models.TaskDetails.project_id).all()
#     employee_project = db.query(
#         models.TaskDetails.employee_id,
#         models.TaskDetails.project_id,
#         models.TaskDetails.task_id,models.ProjectDetails.title
#     ).join(
#         models.ProjectDetails,  # Join the project_details table
#         models.TaskDetails.project_id == models.ProjectDetails.project_id  # On project_id
#     ).filter(
#         models.TaskDetails.employee_id == id
#     ).all()

#     for emp in employee_project:
#         print(emp.project_id)

#     return employee_project

}

#_______________________________________________________________________________________________________

@app.get("/employee",status_code=status.HTTP_200_OK)
async def get_employees(db: db_dependency):
    employees = db.query(models.EmployeeDetails).all()
    return employees


@app.get("/employee/{employee_id}",status_code=status.HTTP_200_OK)
async def get_employee(employee_id: int, db: db_dependency):
    employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


#__________________________________________________________________________________________



@app.get("/projects",status_code=status.HTTP_200_OK)
async def get_projects(db:db_dependency):
    emp_pro = db.query(models.EmployeeProjectsDetails).all()
    return emp_pro

@app.get("/tasks",status_code=status.HTTP_200_OK)
async def get_tasks(db:db_dependency):
    emp_task = db.query(models.EmployeeTasksDetails).all()
    return emp_task

#________________________________________________________________________________________________