# FastAPI related imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.project import projectAPI
from routers.task import taskAPI
from routers.employee import employeeAPI
from routers.associative import associativeAPI
from routers.google import googleAPI

app=FastAPI()


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



# Index Endpoint ________________________________________________________________________________________________________

@app.get("/")
def index():
    return {
        "data": "Hello World!"
    }

project_api = projectAPI()
task_api = taskAPI()
employee_api = employeeAPI()
associative_api = associativeAPI()
google_api = googleAPI()

app.include_router(project_api.router)
app.include_router(task_api.router)
app.include_router(employee_api.router)
app.include_router(associative_api.router)
app.include_router(google_api.router)