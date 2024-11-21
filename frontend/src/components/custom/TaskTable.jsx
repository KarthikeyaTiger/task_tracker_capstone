import React, { useState } from 'react'
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

const TaskTable = ( {data} ) => {
    // const [ data, setData ] = useState(filteredData)

    return (
        <Table className="">
            <TableHeader>
                <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[105px]">Start Date</TableHead>
                    <TableHead className="w-[105px]">Due Date</TableHead>
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
                    </TableRow>
                ))}
                
            </TableBody>
        </Table>
    )
}

export default TaskTable
