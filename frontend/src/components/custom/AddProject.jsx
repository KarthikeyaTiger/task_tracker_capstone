import React, { useState } from 'react'
import axios from 'axios'
import { useGlobalContext } from '../../context/GlobalContext'

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
    project: z.object({
        title: z.string(),
        description: z.string(),
        startdate: z.date({
        required_error: "Start date is required.",
        }),
        enddate: z.date({
        required_error: "End date is required.",
        }),
        project_status: z.string(),
    }),
    employees: z.string().array(),
});
  

const AddProject = ({ handleSubmit }) => {
    const { token } = useGlobalContext();
    const [isFromOpen, setIsFormOpen] = useState(false);
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            project: {
                title: "",
                description: "",
                startdate: new Date(),
                enddate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                project_status: "notStarted",
            },
            employees: []
        },
    })

    const onSubmit = (data) => {
        const formattedStartDate = data.project.startdate.toISOString().split('T')[0];
        const formattedEndDate = data.project.enddate.toISOString().split('T')[0];
        console.log({
            ...data,
            project: {
                ...data.project,
                startdate: formattedStartDate,
                enddate: formattedEndDate,
            }
        })

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://127.0.0.1:8000/project',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data : {
                ...data,
                project: {
                    ...data.project,
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
            <Button className="my-auto" asChild><DialogTrigger>Add Project</DialogTrigger></Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Project Details</DialogTitle>
                    <DialogDescription>
                        Ensure that the details are entered correctly.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <CustomTextField
                            control={form.control}
                            name="project.title"
                            label="Project Title"
                            placeholder="Enter the Project Title"
                        />
                        <CustomTextField
                            control={form.control}
                            name="project.description"
                            label="Description"
                            placeholder="Enter the Description"
                            textarea
                        />
                        <div className='grid grid-cols-2 gap-3'>
                            <CustomDateField 
                                control={form.control}
                                name="project.startdate"
                                label="Start Date"
                            />
                            <CustomDateField
                                control={form.control}
                                name="project.enddate"
                                label="End Date"
                            />
                        </div>
                        <CustomComboboxField 
                            name="employees"
                            label="Project Manager"
                            placeholder="Select the Project Managers"
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

export default AddProject