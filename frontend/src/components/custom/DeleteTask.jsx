import React, { useState } from 'react'
import axios from 'axios'

// shadcn ui components
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"

const DeleteProject = ({ handleSubmit, task_id }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const handleDelete = () => {
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:8000/task/${task_id}`,
            headers: { }
        };

        axios.request(config)
        .then(() => {
            handleSubmit()
        })
        .catch((error) => {
            console.log(error);
        });
    }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className='rounded-sm text-start p-1 px-3 text-sm hover:bg-zinc-100'>Delete</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete your project
                    and tasks of this project.
                </DialogDescription>
            </DialogHeader>
            <div className='flex justify-between space-x-4'>
                <DialogClose asChild>
                    <Button className="w-full" type="button" variant="outline">
                        Cancel
                    </Button>
                </DialogClose>
                <Button className="w-full" type="button" variant="destructive" onClick={handleDelete}>
                    Delete
                </Button>
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default DeleteProject
