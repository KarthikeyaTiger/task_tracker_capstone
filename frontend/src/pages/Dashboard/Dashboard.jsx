import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
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
} from "@/components/ui/carousel"

const Dashboard = () => {
    const [projectData, setProjectData] = useState(null);
    const [projectLoading, setProjectLoading] = useState(true);
    const [projectError, setProjectError] = useState(null);
    
    const [taskData, setTaskData] = useState(null);
    const [taskLoading, setTaskLoading] = useState(true);
    const [taskError, setTaskError] = useState(null);

    const fetchProjectData = async () => {
        try {
            const data = await fetchData(`http://127.0.0.1:8000/project`);
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
            const data = await fetchData(`http://127.0.0.1:8000/task`);
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
        <div className="mx-auto max-w-[900px] px-6">
            <div className="flex justify-between space-x-3 align-center">
                <p className='text-3xl font-bold my-10'>Dashboard</p>
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
                projectLoading ? 
                <p className='text-center'>Loading the projects you are cooking...</p> :
                projectError ? <>{projectError.status + projectError.statustext}</>:
                projectData && projectData.length > 0 ? ( 
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
                ) : <>No Projects found...</>
            }
        </div>
    )
}

export default Dashboard;