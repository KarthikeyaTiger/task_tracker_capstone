import React, { useState, useEffect } from 'react'
import fetchData from '@/hooks/fetchData'
import { useGlobalContext } from '../../context/GlobalContext';
import { Link } from 'react-router-dom';

// shadcn ui components
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

// Icons
import { Menu } from 'lucide-react'

const Sidebar = () => {
  const { user, token } = useGlobalContext();
  const userData = JSON.parse(user)

  const [projectData, setProjectData] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  
  const fetchProjectData = async () => {

    try {
      const response = await fetchData(
        userData.role !== "admin"
        ? (`http://127.0.0.1:8000/project?employee_id=${userData.employee_id}`)
        : (`http://127.0.0.1:8000/project`)
        , token);
      if (response.data) {
        setProjectData(response.data);
      }
    } catch (error) {
      setProjectError(error.response.data.detail);
    } finally {
      setProjectLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProjectData();
  }, [])

  useEffect(() => {
      if (projectData) {
          setProjectLoading(false);
      }
  }, [projectData])

  return (
    <Sheet>
      <SheetTrigger><Menu /></SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
            <SheetTitle>Projects</SheetTitle>
            <SheetDescription>
              All the projects you are a part of
            </SheetDescription>
            <div className='py-10 w-[100%]'>
              {
                projectLoading
                ? <p className='text-center'>Loading the projects you are cooking...</p>
                : projectError 
                ? <div className='text-center my-10'>{projectError}</div>
                : (
                  projectData.map((project, index) => (
                    <Link key={index} to={`/project/${project.project_id}`} className='my-3 p-3 hover:bg-zinc-100 w-[100%]'>
                      {project.title}
                    </Link>
                  ))
                )
              }
            </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default Sidebar;