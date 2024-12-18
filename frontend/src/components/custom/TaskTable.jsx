import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../../context/GlobalContext';

// HTTP Request related imports
import axios from "axios";

// shadcn ui components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Icons
import { Ellipsis } from 'lucide-react'

// Custom components
import EditTask from '@/components/custom/EditTask';
import DeleteTask from '@/components/custom/DeleteTask';
  

const TaskTable = ( { data, handleSubmit } ) => {
    const { token } = useGlobalContext();
    const [taskData, setTaskData] = useState([]);
    
    useEffect(() => {
        if (data) {
            setTaskData(data);
        }
    }, [data])

    const changeStatus = (value, task) => {
        let data = JSON.stringify({
            "task": {
                "task_status": value
            }
        });

        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:8000/task/${task.task_id}`,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data : data
        };

        axios.request(config)
        .then(() => {
            setTaskData(
                taskData.map(item => {
                    if (item.task_id == task.task_id) {
                        return {
                            ...item, task_status: task.task_status
                        }
                    }
                    return item
                })
            )
        })
        .catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className='border rounded-lg my-4'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[150px]">Status</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="min-w-[225px]">Description</TableHead>
                        <TableHead className="min-w-[105px]">Start Date</TableHead>
                        <TableHead className="min-w-[105px]">Due Date</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {taskData.map(task => (
                        <TableRow key={task.task_id}>
                            <TableCell className="font-medium">
                                <Select defaultValue={task.task_status} onValueChange={(value) => {changeStatus(value, task)}}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="notStarted">Not Started</SelectItem>
                                        <SelectItem value="inProgress">In Progress</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{task.description}</TableCell>
                            <TableCell>{task.startdate}</TableCell>
                            <TableCell>{task.enddate}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger><Ellipsis size={14} /></DropdownMenuTrigger>
                                    <DropdownMenuContent className="flex flex-col justify-start space-y-1">
                                        <EditTask
                                            defaultValues={{
                                                task: {
                                                    title: task.title,
                                                    description: task.description,
                                                    startdate: new Date(task.startdate),
                                                    enddate: new Date(task.enddate),
                                                    task_status: task.task_status,
                                                    project_id: task.project_id,
                                                },
                                                employees: [],
                                            }}
                                            handleSubmit = {handleSubmit}
                                            task_id = {task.task_id}
                                            asChild
                                        />
                                        <DeleteTask
                                            handleSubmit={handleSubmit}
                                            task_id={task.task_id}
                                        />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    
                </TableBody>
            </Table>
        </div>
    )
}

export default TaskTable
