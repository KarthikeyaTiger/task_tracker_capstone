import React from 'react'
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

// form related imports
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Form Schema
const formSchema = z.object({
    title: z.string(),
    description: z.string(),
    startdate: z.date({
      required_error: "Start date is required.",
    }),
    enddate: z.date({
      required_error: "End date is required.",
    }),
    employee_id: z.number(),
    project_status: z.string()
});
  

const AddProject = ({
    defaultValues = {
        description: "",
        startdate: new Date(),
        enddate: (new Date()).setMonth(new Date().getMonth()+1),
        project_status: "notStarted"
    },
    type="add"
}) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    })

    const onSubmit = (data) => {
        const formattedStartDate = data.startdate.toISOString().split('T')[0];
        const formattedEndDate = data.enddate.toISOString().split('T')[0];
        console.log("Form submitted with data:", data);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://127.0.0.1:8000/project',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : {
                ...data,
                startdate: formattedStartDate,
                enddate: formattedEndDate,
            }
        };

        axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
    };

    return (
        <Dialog className="mx-10">
            {type==="add" ?
                <Button className="my-auto" asChild><DialogTrigger>Add Project</DialogTrigger></Button> :
                <Button className="my-auto" variant="outline" asChild><DialogTrigger>Edit</DialogTrigger></Button>
            }
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
                            name="title"
                            label="Project Title"
                            placeholder="Enter the Project Title"
                        />
                        <CustomTextField
                            control={form.control}
                            name="description"
                            label="Description"
                            placeholder="Enter the Description"
                            textarea
                        />
                        <div className='grid grid-cols-2 gap-3'>
                            <CustomDateField 
                                control={form.control}
                                name="startdate"
                                label="Start Date"
                            />
                            <CustomDateField
                                control={form.control}
                                name="enddate"
                                label="End Date"
                            />
                        </div>
                        <CustomComboboxField 
                            control={form.control}
                            name="employee_id"
                            label="Project Manager"
                            form={form}
                        />
                        <Button type="submit" className="w-[100%]">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddProject