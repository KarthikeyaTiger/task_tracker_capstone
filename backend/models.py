from sqlalchemy import String,Integer,Column,ForeignKey,Date
from sqlalchemy.orm import relationship
from database import Base


class EmployeeDetails(Base):
    __tablename__ = 'employee_details'

    employee_id = Column(String(36), primary_key=True) 
    name = Column(String(30)) 
    email_id = Column(String(50), unique=True)

    projects = relationship("EmployeeProjectsDetails", back_populates="employee")
    assigned_employee = relationship("EmployeeTasksDetails", back_populates="employees")
    # assigned_tasks = relationship("TaskDetails",back_populates="emp")


class ProjectDetails(Base):
    __tablename__ = 'project_details'

    project_id = Column(String(36),primary_key=True)
    # employee_id = Column(Integer, nullable=False)
    # employee_id = Column(Integer, ForeignKey('employee_details.id'), nullable=False)
    title = Column(String(100),nullable=False)
    description = Column(String(1000))  
    startdate = Column(Date)  
    enddate = Column(Date)  
    project_status = Column(String(20))

    # email_id = Column(String(50))
    # employee = relationship("EmployeeDetails", back_populates="projects")


    employeeprojects = relationship("EmployeeProjectsDetails",back_populates="project")
    tasks = relationship("TaskDetails",back_populates="assigned_project")


class TaskDetails(Base):
    __tablename__ = 'task_details'

    task_id = Column(String(36), primary_key=True)  
    project_id = Column(String(36), ForeignKey('project_details.project_id'), nullable=False)
    # project_id = Column(Integer, nullable=False)  
    # employee_id = Column(Integer, ForeignKey('employee_details.id'), nullable=False)
    title = Column(String(100))  
    description = Column(String(1000)) 
    startdate = Column(Date) 
    enddate = Column(Date)  
    task_status = Column(String(20))  
    # email_id = Column(String(50))

    assigned_project = relationship("ProjectDetails", back_populates="tasks")
    assigned_tasks = relationship("EmployeeTasksDetails",back_populates="task")
    # emp = relationship("EmployeeDetails",back_populates="assigned_tasks")


class EmployeeProjectsDetails(Base):
    __tablename__ = "employee_projects"

    project_id = Column(String(36),ForeignKey('project_details.project_id'),primary_key=True)
    employee_id = Column(String(36),ForeignKey('employee_details.employee_id'),primary_key=True)

    employee = relationship("EmployeeDetails", back_populates="projects")
    project = relationship("ProjectDetails",back_populates="employeeprojects")


class EmployeeTasksDetails(Base):
    __tablename__ = "employee_tasks"

    employee_id = Column(String(36),ForeignKey('employee_details.employee_id'),primary_key=True)
    task_id = Column(String(36),ForeignKey('task_details.task_id'),primary_key=True)

    task = relationship("TaskDetails",back_populates="assigned_tasks")
    employees = relationship("EmployeeDetails",back_populates="assigned_employee")