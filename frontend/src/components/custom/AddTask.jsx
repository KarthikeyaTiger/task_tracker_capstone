import React, { useState } from 'react'
import axios from 'axios'

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

// Icons
import { Plus } from 'lucide-react'

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
  

const AddTask = ({ handleSubmit, project_id }) => {
    const [isFromOpen, setIsFormOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            task: {
                description: "",
                startdate: new Date(),
                enddate: (new Date()).setMonth(new Date().getMonth()+1),
                task_status: "notStarted",
                project_id: project_id,
            },
        },
    })

    const onSubmit = (data) => {
        const formattedStartDate = data.task.startdate.toISOString().split('T')[0];
        const formattedEndDate = data.task.enddate.toISOString().split('T')[0];

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://127.0.0.1:8000/task',
            headers: { 
                'Content-Type': 'application/json'
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
            <Button className="my-auto p-3 rounded-full" asChild><DialogTrigger><Plus /></DialogTrigger></Button>
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
                            name="employees"
                            placeholder="Select Employees for Task"
                            label="Assign Task"
                            control={form.control}
                            form={form}
                            url="http://127.0.0.1:8000/employee"
                        />
                        <Button type="submit" className="w-[100%]">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddTask