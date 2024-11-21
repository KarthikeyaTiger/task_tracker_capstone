from sqlalchemy import String,Integer,Column,ForeignKey,Date
from sqlalchemy.orm import relationship
from database import Base


class EmployeeDetails(Base):
    __tablename__ = 'employee_details'

    id = Column(Integer, primary_key=True) 
    name = Column(String(20)) 
    mail_id = Column(String(50), unique=True)

    projects = relationship("ProjectDetails", back_populates="employee")
    assigned_tasks = relationship("TaskDetails",back_populates="emp")


class ProjectDetails(Base):
    __tablename__ = 'project_details'

    project_id = Column(Integer,primary_key=True)
    # employee_id = Column(Integer, nullable=False)
    employee_id = Column(Integer, ForeignKey('employee_details.id'), nullable=False)
    title = Column(String(20),nullable=False)
    description = Column(String(100))  
    startdate = Column(Date)  
    enddate = Column(Date)  
    project_status = Column(String(20))
    # email_id = Column(String(50))

    employee = relationship("EmployeeDetails", back_populates="projects")

    tasks = relationship("TaskDetails",back_populates="project")


class TaskDetails(Base):
    __tablename__ = 'task_details'

    task_id = Column(Integer, primary_key=True)  
    # project_id = Column(Integer, nullable=False) 
    project_id = Column(Integer, ForeignKey('project_details.project_id'), nullable=False) 
    employee_id = Column(Integer, ForeignKey('employee_details.id'), nullable=False)
    title = Column(String(20))  
    description = Column(String(100)) 
    startdate = Column(Date) 
    enddate = Column(Date)  
    task_status = Column(String(20))  
    # email_id = Column(String(50))

    project = relationship("ProjectDetails", back_populates="tasks")
    emp = relationship("EmployeeDetails",back_populates="assigned_tasks")