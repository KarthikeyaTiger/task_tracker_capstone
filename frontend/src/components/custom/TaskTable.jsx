import React, { useEffect, useState } from 'react'
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
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis } from 'lucide-react'
  

const TaskTable = ( {response} ) => {
    const [data, setData] = useState([])

    useEffect(() => {
        if (response) {
            setData(response);
        }
    }, [response])

    return (
        <div className='border rounded-lg my-4'>
            <Table className="">
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
                    {data.map(task => (
                        <TableRow key={task.task_id}>
                            <TableCell className="font-medium">
                                <Select defaultValue={task.task_status}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inProgress">In Progress</SelectItem>
                                        <SelectItem value="notStarted">Not Started</SelectItem>
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
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
