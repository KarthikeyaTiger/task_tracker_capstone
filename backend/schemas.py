from pydantic import BaseModel
from datetime import date
from typing import Optional,List
import requests


class EmployeeDetailsCreate(BaseModel):
    employee_id: str
    name: str
    email_id: str
    picture: str
    role: str

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
    employees: Optional[List[str]] = None

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
    employees: Optional[List[str]] = None

class EmployeeProjectDetails(BaseModel):
    project_id: str
    employee_id: str
    role: str

class GoogleLoginRequest(BaseModel):
    token: str