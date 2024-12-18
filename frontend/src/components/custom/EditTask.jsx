import React, { useState } from 'react'
import axios from 'axios'
import { useGlobalContext } from '@/context/GlobalContext'

// custom components
import CustomTextField from "@/components/common/CustomTextField"
import CustomDateField from "@/components/common/CustomDateField"
import CustomComboboxField from "@/components/common/CustomComboboxField"

// shadcn ui components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

// form related imports
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Form Schema
const formSchema = z.object({
    task: z.object({
        title: z.string(),
        description: z.string(),
        startdate: z.date({
            required_error: "Start date is required.",
        }),
        enddate: z.date({
            required_error: "End date is required.",
        }),
        task_status: z.string(),
        project_id: z.string(),
    }),
    employees: z.string().array(),
});
  

const EditTask = ({ handleSubmit, defaultValues, task_id }) => {
    const { token } = useGlobalContext()
    const [isFromOpen, setIsFormOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    })

    const onSubmit = (data) => {
        const formattedStartDate = new Date(data.task.startdate).toLocaleDateString('en-CA');
        const formattedEndDate = new Date(data.task.enddate).toLocaleDateString('en-CA');

        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:8000/task/${task_id}`,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data : {
                ...data,
                task: {
                    ...data.task,
                    startdate: formattedStartDate,
                    enddate: formattedEndDate,
                }
            }
        };

        axios.request(config)
        .then(() => {
            handleSubmit()
            setIsFormOpen(false);
        })
        .catch((error) => {
            console.log(error);
        });
    };

    return (
        <Dialog className="mx-10" open={isFromOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger className='rounded-sm text-start p-1 px-3 text-sm hover:bg-zinc-100'>Edit</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Task Details</DialogTitle>
                    <DialogDescription>
                        Ensure that the details are entered correctly.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <CustomTextField
                            control={form.control}
                            name="task.title"
                            label="Task Title"
                            placeholder="Enter the Task Title"
                        />
                        <CustomTextField
                            control={form.control}
                            name="task.description"
                            label="Description"
                            placeholder="Enter the Description"
                            textarea
                        />
                        <div className='grid grid-cols-2 gap-3'>
                            <CustomDateField 
                                control={form.control}
                                name="task.startdate"
                                label="Start Date"
                            />
                            <CustomDateField
                                control={form.control}
                                name="task.enddate"
                                label="End Date"
                            />
                        </div>
                        <CustomComboboxField 
                            control={form.control}
                            name="employees"
                            label="Assign Task"
                            form={form}
                            placeholder="Select the Task Assignees"
                            url="http://127.0.0.1:8000/employee"
                            selected = {`http://127.0.0.1:8000/tasks?task_id=${task_id}`}
                        />
                        <Button type="submit" className="w-[100%]">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditTask