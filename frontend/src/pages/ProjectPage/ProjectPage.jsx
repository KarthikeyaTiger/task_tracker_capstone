import React, { useEffect, useState } from 'react'
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';

// custom components
import TaskTable from '@/components/custom/TaskTable'
import EditProject from '@/components/custom/EditProject';
import Navbar from '@/components/custom/Navbar';

// shadcn ui components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Icons
import { Dot } from 'lucide-react'
import fetchData from '@/hooks/fetchData';
import DeleteProject from '@/components/custom/DeleteProject';
import AddTask from '@/components/custom/AddTask';

const ProjectPage = () => {
    const navigate = useNavigate()
    const { projectId } = useParams();
    const { token, user, isAuthenticated } = useGlobalContext();
    if (!isAuthenticated) {
        navigate('/login')
    }
    const userData = JSON.parse(user)

    const [projectData, setProjectData] = useState(null);
    const [projectLoading, setProjectLoading] = useState(true);
    const [projectError, setProjectError] = useState(null);
    
    const [allTaskData, setAllTaskData] = useState(null);
    const [allTaskLoading, setAllTaskLoading] = useState(true);
    const [allTaskError, setAllTaskError] = useState(null);
    
    const [employeeTaskData, setEmployeeTaskData] = useState(null);
    const [employeeTaskLoading, setEmployeeTaskLoading] = useState(true);
    const [employeeTaskError, setEmployeeTaskError] = useState(null);

    const fetchProjectData = async () => {
        try {
            const response = await fetchData(`http://127.0.0.1:8000/project/${projectId}`, token);
            if (response.data) {
                setProjectData(response.data);
            }
        } catch (error) {
            setProjectError(error.response.data.detail);
        } finally {
            setProjectLoading(false)
        }
    }

    const fetchAllTaskData = async () => {
        try {
            const response = await fetchData(`http://127.0.0.1:8000/task?project_id=${projectId}`, token);
            if (response.data) {
                setAllTaskData(response.data);
            }
        } catch (error) {
            setAllTaskError(error.response.data.detail);
        } finally {
            setAllTaskLoading(false)
        }
    }

    const fetchEmployeeTaskData = async () => {
        try {
            const response = await fetchData(`http://127.0.0.1:8000/task?project_id=${projectId}&employee_id=${userData.employee_id}`, token);
            if (response.data) {
                setEmployeeTaskData(response.data);
                setEmployeeTaskError(null);
            }
        } catch (error) {
            setEmployeeTaskError(error.response.data.detail);
        } finally {
            setEmployeeTaskLoading(false)
        }
    }

    useEffect(() => {
        fetchProjectData();
        fetchAllTaskData();
        fetchEmployeeTaskData()
    }, [])

    useEffect(() => {
        if (projectData) {
            setProjectLoading(false);
        }
        if (allTaskData) {
            setAllTaskLoading(false);
        }
        if (employeeTaskData) {
            setAllTaskLoading(false);
        }
    }, [projectData, allTaskData])

    if (projectLoading) return <p className='text-center mt-52'>Loading project details...</p>
    if (projectError) return <p>{projectError}</p>

    return (
        <>
            <Navbar />
            <div className='container max-w-[950px] mx-auto my-5 px-8'>
                <div className='flex justify-between'>
                    <Breadcrumb className="my-auto">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Projects</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{projectData.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    {
                        userData.role === "admin"
                        && <div className='space-x-3 flex'>
                            <EditProject
                                handleSubmit= {fetchProjectData}
                                defaultValues={{
                                    project: {
                                        title: projectData.title,
                                        description: projectData.description,
                                        startdate: new Date(projectData.startdate),
                                        enddate: new Date(projectData.enddate),
                                        project_status: projectData.project_status
                                    },
                                    employees: projectData.employees,

                                }}
                                project_id={projectData.project_id}
                            />
                            <DeleteProject project_id={projectData.project_id} />
                        </div>
                    }
                </div>
                <div>
                    <p className="text-2xl font-semibold mt-6">{projectData.title}</p>
                    <p className="text-md mt-3 text-zinc-700">
                        {projectData.description}
                    </p>
                </div>
                <div className='flex space-x-3 my-6'>
                    <p className='text-sm'><span className='text-zinc-700'>Start Date:</span> <span className='font-medium'>{projectData.startdate}</span></p>
                    <Dot />
                    <p className='text-sm'><span className='text-zinc-700'>End Date:</span> <span className='font-medium'>{projectData.enddate}</span></p>
                </div>
                <div className='mt-8 flex space-x-3'>
                    <Tabs defaultValue="myTasks" className='grow'>
                        <div className='flex space-x-3'>
                            <TabsList className="grow flex justify-around rounded-full">
                                <TabsTrigger value="myTasks" className="rounded-full grow">My Tasks</TabsTrigger>
                                <TabsTrigger value="allTasks" className="rounded-full grow">All Tasks</TabsTrigger>
                            </TabsList>
                            
                            <AddTask
                                handleSubmit = {fetchAllTaskData}
                                project_id={projectId}
                            />
                        </div>
                        <TabsContent value="myTasks" className="max-w-[85vw]">
                            {
                                employeeTaskLoading
                                ? <>Loading data</> 
                                : (
                                    employeeTaskError
                                    ? <div>{employeeTaskError}</div> 
                                    : <TaskTable handleSubmit={fetchEmployeeTaskData} data={employeeTaskData} />
                                )
                            }
                        </TabsContent>
                        <TabsContent value="allTasks" className="max-w-[85vw]">
                            {
                                allTaskLoading
                                ? <>Loading data</> 
                                : (
                                    allTaskError
                                    ? <div>{allTaskError}</div> 
                                    : <TaskTable handleSubmit={fetchAllTaskData} data={allTaskData} />
                                )
                            }
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    )
}

export default ProjectPage