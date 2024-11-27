import React, { useEffect, useState } from 'react'
import { Link, Navigate } from "react-router-dom"
import { useGlobalContext } from '../../context/GlobalContext';
import fetchData from '@/hooks/fetchData';

// Custom Components
import Projects from "@/components/custom/Projects";
import TaskTable from "@/components/custom/TaskTable";
import AddProject from "@/components/custom/AddProject";

// shadcn ui components
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Navbar from '@/components/custom/Navbar';

const Dashboard = () => {
    const { isAuthenticated, user } = useGlobalContext();
    const userData = JSON.parse(user)

    const [projectData, setProjectData] = useState(null);
    const [projectLoading, setProjectLoading] = useState(true);
    const [projectError, setProjectError] = useState(null);
    
    const [taskData, setTaskData] = useState(null);
    const [taskLoading, setTaskLoading] = useState(true);
    const [taskError, setTaskError] = useState(null);

    const fetchProjectData = async () => {
        try {
            const data = await fetchData(`http://127.0.0.1:8000/project?employee_id=${userData.employee_id}`);
            if (data) {
                setProjectData(data);
            }
        } catch (error) {
            setProjectError(error);
            console.error("Error fetching project data:", error);
        }
    }

    const fetchTaskData = async () => {
        try {
            const data = await fetchData(`http://127.0.0.1:8000/task?employee_id=${userData.employee_id}`);
            if (data) {
                setTaskData(data);
            }
        } catch (error) {
            setTaskError(error);
            console.error("Error fetching project data:", error);
        }
    }

    useEffect(() => {
        fetchProjectData();
        fetchTaskData();
    }, [])

    useEffect(() => {
        if (projectData) {
            setProjectLoading(false);
        }
        if (taskData) {
            setTaskLoading(false);
        }
    }, [projectData, taskData])
    
    return(
        isAuthenticated
        ? (
        <>
            <Navbar />
            <div className="mx-auto max-w-[1000px] px-6 my-8">
                <div className="flex justify-between space-x-3 align-center">
                    <p className='text-3xl font-bold mb-10'>Dashboard</p>
                    <AddProject handleSubmit={fetchProjectData} />
                </div>
                {taskLoading ?
                <p className='text-center'> Hang on while we load your tasks... </p> : 
                (
                    taskError ? 
                    <div className='text-center'>
                        {taskError.response.data.detail}
                    </div>
                    :
                    <TaskTable data={taskData} handleSubmit={fetchTaskData} />
                )
                }
                {
                    projectLoading
                    ? <p className='text-center'>Loading the projects you are cooking...</p>
                    : projectError ? <>{projectError.status + projectError.statustext}</>
                    : projectData && projectData.length > 0 
                    ? ( 
                        <div>
                            <Carousel>
                                <CarouselContent>
                                    {projectData.map((project, index) => (
                                        <CarouselItem key={index} className="md:basis-1/2">
                                            <Link to={`/project/${project.project_id}`}>
                                                <Projects project={project} />
                                            </Link>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="-left-4" />
                                <CarouselNext className="-right-4" />
                            </Carousel>
                        </div>
                    )
                    : <p>No Projects found...</p>
                }
            </div>
        </>)
        : <Navigate to="/login"/>
    )
}

export default Dashboard;