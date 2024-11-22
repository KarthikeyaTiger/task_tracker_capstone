import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useParams } from 'react-router-dom';
import { z } from "zod"

// custom components
import AddProject from '@/components/custom/AddProject'

// shadcn ui components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Icons
import { Dot, Plus } from 'lucide-react'
import TaskTable from '@/components/custom/TaskTable'

const ProjectPage = () => {
    const { projectId } = useParams();
    const [projectData, setProjectData] = useState([]);
    const [projectLoading, setProjectLoading] = useState(true);
    const [projectError, setProjectError] = useState(null);
    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:8000/project/${projectId}`,
            headers: { }
        };
        axios.request(config)
        .then((response) => {
            setProjectData(response.data);
            setProjectLoading(false);
        })
        .catch((error) => {
            setProjectError(error);
        });
      }, []);

    const [taskData, setTaskData] = useState([]);
    const [taskLoading, setTaskLoading] = useState(true);
    const [taskError, setTaskError] = useState(null);
    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:8000/task?project_id=${projectId}`,
            headers: { }
        };
    
        axios.request(config)
        .then((response) => {
            setTaskData(response.data)
            setTaskLoading(false);
        })
        .catch((error) => {
            setTaskError(error);
        });
    }, [])

    if (projectLoading) return <p>Loading project details...</p>
    if (projectError) return <p>{projectError}</p>

    return (
        <div className='container max-w-[950px] mx-auto my-10 px-8'>
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
                <div className='space-x-3'>
                    <AddProject 
                    defaultValues = {{
                        title: projectData.title,
                        description: projectData.description,
                        startdate: new Date(projectData.startdate),
                        enddate: z.date(new Date(projectData.enddate)),
                    }}
                    type='edit'
                    />
                </div>
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
                        <Button className="rounded-full p-3"><Plus /></Button>
                    </div>
                    <TabsContent value="myTasks" className="max-w-[85vw]">
                        {taskLoading ? <>Loading data</> : 
                        (
                            taskError ? <>error</>:<TaskTable data={taskData} />
                        )
                        }
                    </TabsContent>
                    <TabsContent value="allTasks">Change your password here.</TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default ProjectPage





