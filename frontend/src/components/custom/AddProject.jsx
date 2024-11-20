import React from 'react'

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

// Form
const formSchema = z.object({
    title: z.string(),
    description: z.string(),
    start_date: z.date({
        required_error: "Start date is required.",
    }),
    end_date: z.date({
        required_error: "Start date is required.",
    }),
    projectManager: z.string()
})


const AddProject = () => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    })

    const onSubmit = (data) => {
        console.log("Form submitted with data:", data);
    };

    return (
        <Dialog className="mx-10">
            <Button asChild><DialogTrigger>Add Project</DialogTrigger></Button>
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
                                name="start_date"
                                label="Start Date"
                            />
                            <CustomDateField
                                control={form.control}
                                name="end_date"
                                label="End Date"
                            />
                        </div>
                        <CustomComboboxField 
                            control={form.control}
                            name="projectManager"
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