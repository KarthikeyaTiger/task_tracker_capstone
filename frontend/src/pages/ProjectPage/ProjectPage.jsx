import React from 'react'
import tasks from '@/tasks.json';

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
    console.log(tasks)
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
                            <BreadcrumbPage>Project Name</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className='space-x-3'>
                    <Button variant="outline">Edit</Button>
                    <AddProject />
                </div>
            </div>
            <div>
                <p className="text-2xl font-semibold mt-6">Project Name</p>
                <p className="text-md mt-3 text-zinc-700">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Exercitationem, optio! Atque veritatis qui nulla porro magni voluptas in nostrum molestiae. Suscipit, dolorum sint? Praesentium velit molestias libero modi dolorum amet.
                </p>
            </div>
            <div className='flex space-x-3 my-6'>
                <p className='text-sm'><span className='text-zinc-700'>Start Date:</span> <span className='font-medium'>Nov 8, 2024</span></p>
                <Dot />
                <p className='text-sm'><span className='text-zinc-700'>End Date:</span> <span className='font-medium'>Jan 8, 2025</span></p>
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
                        <TaskTable data={tasks} />
                    </TabsContent>
                    <TabsContent value="allTasks">Change your password here.</TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default ProjectPage
