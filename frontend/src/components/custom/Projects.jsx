import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState,useEffect } from 'react'  
import axios from "axios"
import { Link } from "react-router-dom"



const Projects = () => {

    const [projects,setProjects] = useState([]);
    const [pro,setPro] = useState(false);
    const statusCodes = {
        "inProgress": ["In Progress", " bg-blue-900 hover:bg-blue-200"],
        "completed": ["Completed", " bg-green-800 hover:bg-green-200"],
        "notStarted": ["Not Started", " bg-zinc-900 hover:bg-zinc-200"],
        "blocked": ["Blocked", " bg-red-900 hover:bg-red-200"]
    }

    
    useEffect(() => {
        var config = {
            method: 'get',
            url: 'http://127.0.0.1:8000/project',
            headers: { }
          };
          
          axios(config)
          .then(function (response) {
            setProjects(response.data)
            setPro(true) 
          })
          .catch(function (error) {
            console.log(error);
          });
         
    },[])

    return (
        <div>
        {
            pro ?
        
        <Carousel className="my-5">
            <CarouselContent className="space-x-5 p-6">
                {projects.map((project, index) => (
                    <CarouselItem key={index} className="px-1 sm:basis-1/2 lg:basis-1/2">
                        <Link to={`/project/${project.project_id}`}>
                            <Card className="bg-white border border-gray-300 rounded-xl h-[100%] min-w-[310px]">
                                <CardContent className="p-8 py-10">
                                    {/* <h3 class="text-xl font-semibold">{notification.title}</h3> */}
                                    <Badge className={("text-white px-2 py-[1px] rounded-full mb-2" + statusCodes[project.project_status][1])}>
                                        <p className="items-center gap-2 text-[10px]">{statusCodes[project.project_status][0]}</p>
                                    </Badge>
                                    <div className="flex content-center justify-between space-x-3">
                                        <p className="font-semibold text-xl"> {project.title} </p>
                                        <p className="text-xs text-blue-800 my-auto font-normal"> {project.startdate} to {project.enddate}</p>
                                    </div>
                                    <p className="mt-5 text-gray-700">{project.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2" />
                <CarouselNext className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2" />
            </Carousel>:<p>Data Loading</p>}
       </div>
    )
}

export default Projects;
