from fastapi import FastAPI,Depends,status,HTTPException,Query
from typing import Annotated,Dict
import models
import schemas
from database import engine,SessionLocal
from sqlalchemy.orm import Session
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import uuid
from fastapi.security import OAuth2PasswordBearer
import requests

app=FastAPI()
models.Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]

def verify_google_token(db:db_dependency,token: str = Depends(oauth2_scheme)) -> Dict:
    
    url = f"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={token}"
    response = requests.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google access token")
    
    user_info = response.json()
    
    db_role = db.query(models.EmployeeDetails.role).filter(models.EmployeeDetails.employee_id == user_info.get('sub')).first()
    user_info["role"] = db_role[0]

    return user_info 

@app.post("/project",status_code=status.HTTP_201_CREATED)
async def create_project(project_details:schemas.CreateProject,db:db_dependency, user: dict = Depends(verify_google_token)):
    if user["role"] == "user":
        return "Your are not an admin"
    
    project = project_details.project
    project_id = str(uuid.uuid4())
    db_project=models.ProjectDetails(project_id=project_id,**project.model_dump())
    db.add(db_project)
    db.commit()
    for employee in project_details.employees:
        print(employee)
        db_employeeproject =  models.EmployeeProjectsDetails(project_id=project_id,employee_id=employee,role="manager")
        db.add(db_employeeproject)
        db.commit()


@app.get('/project/{id}', status_code=status.HTTP_200_OK)
async def projectid(db:db_dependency,id:str, user: dict = Depends(verify_google_token)):
    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == id).first()
    if project is None:
        return HTTPException(status_code=404, detail="No project's found")
    return project


@app.get('/project', status_code=status.HTTP_200_OK)
async def get_project(db: db_dependency, employee_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
    projects=[]

    if employee_id:
        employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.employee_id == employee_id).first()
        
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        project_list = db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.employee_id == employee_id).all()
        
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
async def delete_project(project_id:str,db:db_dependency,user: dict = Depends(verify_google_token)):

    if user["role"] == "user":
        return "Your are not an admin"
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
async def update_project(project_id: str, project_update: schemas.UpdateProject, db: db_dependency,user: dict = Depends(verify_google_token)):
    
    if user["role"] == "user":
        return "Your are not an admin"
    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in project_update.project.model_dump(exclude_unset=True).items():
        setattr(project, key, value) 
    
    db.commit() 

       
    if project_update.employees:   
        projectemployee = db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.project_id == project_id).all()
        
        for pro in projectemployee:
            db.delete(pro)
            db.commit()

        for employee in project_update.employees:
            db_projectemployee=models.EmployeeProjectsDetails(project_id=project_id,employee_id=employee,role="manager")
            db.add(db_projectemployee)
            db.commit()


# ________________________________________________________________________________________________________


@app.post('/task',status_code=status.HTTP_201_CREATED)
async def create_task(task_details:schemas.Createtask,db:db_dependency, user: dict = Depends(verify_google_token)):

    manager_ids = await get_projects(db,task_details.task.project_id)
    manager_ids = list(manager_ids[0])
    if user.get('sub') in manager_ids or user["role"] == "Admin":
        db_project = db.query(models.ProjectDetails).filter(models.ProjectDetails.project_id == task_details.task.project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="project not found")
        
        task=task_details.task
        task_id=str(uuid.uuid4())
        db_task=models.TaskDetails(task_id=task_id,**task.model_dump())
        db.add(db_task)
        db.commit()
        id_project=task_details.task.project_id

        for employee in task_details.employees:
            print(employee)
            db_employeetask = models.EmployeeTasksDetails(task_id=task_id,employee_id=employee)
            db.add(db_employeetask)
            db.commit()
        
        for employee in task_details.employees:
            print(employee)
            db_emp_project = db.query(models.EmployeeProjectsDetails).filter(models.EmployeeProjectsDetails.employee_id == employee).filter(models.EmployeeProjectsDetails.project_id == id_project).first()
            print(db_emp_project)
            if db_emp_project:
                print("Already exists")
            else:
                db_employeeproject = models.EmployeeProjectsDetails(project_id=task.project_id,employee_id=employee,role="employee")
                db.add(db_employeeproject)
                db.commit()
    else:
        return "Your are not a manager or admin to create a Task" 


@app.get('/task/{id}', status_code=status.HTTP_200_OK)
async def all_task(db:db_dependency,id:str, user: dict = Depends(verify_google_token)):
    task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == id).first()
    if task is None:
        return HTTPException(status_code=404, detail="No tasks's Not found")
    return task


@app.get('/task', status_code=status.HTTP_200_OK)
async def get_task(db: db_dependency,project_id: Optional[str] = Query(None), employee_id: Optional[str] = Query(None), user: dict = Depends(verify_google_token)):
    tasks=[]

    if project_id and employee_id:
        all_tasks = db.query(models.TaskDetails).filter(models.TaskDetails.project_id == project_id)
        tasks_with_employees = all_tasks.join(
                    models.EmployeeTasksDetails, 
                    models.TaskDetails.task_id == models.EmployeeTasksDetails.task_id
                ).all()
        return tasks_with_employees
    elif project_id:
        print("project_id")
        tasks = db.query(models.TaskDetails).filter(models.TaskDetails.project_id == project_id).all()
    elif employee_id:
        tasks_emp = db.query(models.EmployeeTasksDetails).filter(models.EmployeeTasksDetails.employee_id == employee_id).all()
        if tasks_emp:
            for task_emp in tasks_emp:
                task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_emp.task_id).first()
                tasks.append(task)
        else:
            raise HTTPException(status_code=404, detail="No Employee Found")
    else:
        tasks=db.query(models.TaskDetails).all()
    
    if not tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return tasks


@app.delete('/task/{task_id}',status_code=status.HTTP_200_OK)
async def delete_task(task_id:str,db:db_dependency,user: dict = Depends(verify_google_token)):
    
    project_id = db.query(models.TaskDetails.project_id).filter(models.TaskDetails.task_id == task_id).first()

    manager_ids = await get_projects(db,project_id[0])

    if user.get('sub') in manager_ids or user["role"] == "Admin":
        task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).first()
        task_employee = db.query(models.EmployeeTasksDetails).filter(models.EmployeeTasksDetails.task_id == task_id).all()
        if task is None:
            return HTTPException(status_code=404, detail='task Not found')
        for t in task_employee:
            db.delete(t)
            db.commit()
        db.delete(task)
        db.commit()
    else:
        return "Your neither an admin nor Manager"


@app.put('/task/{task_id}',status_code=status.HTTP_200_OK)
async def taskid(task_id:str,task_update:schemas.UpdateTask,db:db_dependency,user: dict = Depends(verify_google_token)):

    project_id = db.query(models.TaskDetails.project_id).filter(models.TaskDetails.task_id == task_id).first()

    manager_ids = await get_projects(db,project_id[0])

    if user.get('sub') in manager_ids or user["role"] == "Admin":
        task = db.query(models.TaskDetails).filter(models.TaskDetails.task_id == task_id).first()
        if task is None:
            return HTTPException(status_code=404, detail='task Not found')
        for key, value in task_update.task.model_dump(exclude_unset=True).items():
            setattr(task, key, value) 
        db.commit()

        if task_update.employees:
            taskemployee = db.query(models.EmployeeTasksDetails).filter(models.EmployeeTasksDetails.task_id == task_id).all()
            for task in taskemployee:
                db.delete(task)
                db.commit()
            for employee in task_update.employees:
                db_projectemployee=models.EmployeeTasksDetails(task_id=task_id,employee_id=employee)
                db.add(db_projectemployee)
                db.commit()
    else:
        return "Your neither an admin nor Manager"





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
async def get_projects(db:db_dependency, project_id: Optional[str] = Query(None)):
    if project_id:
        result = db.query(models.EmployeeProjectsDetails.employee_id).filter(
            models.EmployeeProjectsDetails.project_id == project_id,
            models.EmployeeProjectsDetails.role == "manager"
        ).distinct().all()
        print(result)

        return result
    emp_pro = db.query(models.EmployeeProjectsDetails).all()
    return emp_pro

@app.get("/tasks",status_code=status.HTTP_200_OK)
async def get_tasks(db:db_dependency, task_id: Optional[str] = Query(None)):
    if task_id:
        result = db.query(models.EmployeeTasksDetails.employee_id).filter(
            models.EmployeeTasksDetails.task_id == task_id
        ).distinct().all()

        return result

    emp_task = db.query(models.EmployeeTasksDetails).all()
    return emp_task

#________________________________________________________________________________________________


@app.post("/auth/google")
async def authenticate_google_user(request: schemas.GoogleLoginRequest,db:db_dependency):
    access_token = request.token
    url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={access_token}"
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Parse the user data from the response
    user_info = response.json()
    print(user_info)

    user_data = {
        "employee_id": user_info["sub"],  # Google user ID
        "name": user_info.get("name"),
        "email_id": user_info.get("email"),
        "picture": user_info.get("picture"),
        "role":"user"
    }

    existing_employee = db.query(models.EmployeeDetails).filter(models.EmployeeDetails.employee_id==user_data["employee_id"]).first()

    if existing_employee:
        return existing_employee
    else:
        db_employee = models.EmployeeDetails(**user_data)
        db.add(db_employee)
        db.commit()

    return user_data