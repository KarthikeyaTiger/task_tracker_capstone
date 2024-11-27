import React from 'react'
import axios from 'axios'
import { useGlobalContext } from '../../context/GlobalContext'

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

// icons
import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
  

const DeleteProject = ({ project_id }) => {
    const { token } = useGlobalContext();
    const navigate = useNavigate();
    const handleDelete = () => {
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:8000/project/${project_id}`,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        axios.request(config)
        .then(() => {
            navigate('/')
        })
        .catch((error) => {
            console.log(error);
        });
    }

  return (
    <Dialog>
        <Button className="my-auto" type="button" variant="destructive" asChild>
            <DialogTrigger>
                <Trash2 />
            </DialogTrigger>
        </Button>

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
