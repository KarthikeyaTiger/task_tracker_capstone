import React, { useEffect, useState } from 'react'
import { Link, Navigate } from "react-router-dom"
import { useGlobalContext } from '../../context/GlobalContext';
import fetchData from '@/hooks/fetchData';

// Custom Components
import Projects from "@/components/custom/Projects";
import TaskTable from "@/components/custom/TaskTable";
import AddProject from "@/components/custom/AddProject";
import Navbar from '@/components/custom/Navbar';

const Dashboard = () => {
    const { isAuthenticated, user, token } = useGlobalContext();
    const userData = JSON.parse(user)

    const [projectData, setProjectData] = useState(null);
    const [projectLoading, setProjectLoading] = useState(true);
    const [projectError, setProjectError] = useState(null);
    
    const [taskData, setTaskData] = useState(null);
    const [taskLoading, setTaskLoading] = useState(true);
    const [taskError, setTaskError] = useState(null);

    const fetchProjectData = async () => {
        try {
            const response = await fetchData(
                userData.role !== "admin"
                ? (`http://127.0.0.1:8000/project?employee_id=${userData.employee_id}`)
                : ("http://127.0.0.1:8000/project")
                , token
            );

            if (response.data) {
                setProjectData(response.data);
                setProjectError(null)
            }

        } catch (error) {
            setProjectError(error.response.data.detail);
        } finally {
            setProjectLoading(false)
        }
    }

    const fetchTaskData = async () => {
        try {
            const response = await fetchData(
                userData.role !== "admin"
                ? (`http://127.0.0.1:8000/task?employee_id=${userData.employee_id}`)
                : (`http://127.0.0.1:8000/task`)
                , token);
            if (response.data) {
                setTaskData(response.data);
                setTaskError(null)
            }
        } catch (error) {
            setTaskError(error.response.data.detail);
        } finally {
            setTaskLoading(false)
        }
    }

    useEffect(() => {
        fetchProjectData();
        fetchTaskData();
    }, [])

    
    return(
        isAuthenticated
        ? (
        <>
            <Navbar />
            <div className="mx-auto max-w-[1000px] px-6 my-8">
                <div className="flex justify-between space-x-3 align-center">
                    <p className='text-3xl font-bold mb-10'>Dashboard</p>
                    {
                        userData.role==="admin"
                        && <AddProject handleSubmit={fetchProjectData} />
                    }
                </div>
                {taskLoading ?
                <p className='text-center'> Hang on while we load your tasks... </p> : 
                (
                    taskError ? 
                    <div className='text-center my-10'>
                        {taskError}
                    </div>
                    :
                    <TaskTable data={taskData} handleSubmit={fetchTaskData} />
                )
                }
                {
                    projectLoading
                    ? <p className='text-center'>Loading the projects you are cooking...</p>
                    : projectError 
                    ? <div className='text-center my-10'>{projectError}</div>
                    : ( 
                        <div className="grid md:grid-cols-2 gap-4">
                            {projectData.map((project, index) => (
                                    <Link key={index} to={`/project/${project.project_id}`}>
                                        <Projects handleSubmit={fetchProjectData} project={project} />
                                    </Link>
                            ))}
                        </div>
                    )
                }
            </div>
        </>)
        : <Navigate to="/login"/>
    )
}

export default Dashboard;