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



const Projects = () => {

    const [projects,setProjects] = useState([]);
    const [pro,setPro] = useState(false);


    
    useEffect(() => {
        var config = {
            method: 'get',
            url: 'http://127.0.0.1:8000/project?employee_id=2',
            headers: { }
          };
          
          axios(config)
          .then(function (response) {
            setProjects(response.data)
            setPro(true) 
            // console.log(projects);
            // console.log(JSON.stringify(response.data));
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
            <CarouselContent className="space-x-3 px-5">
                {projects.map((project,index) => (
                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                        <Card className="bg-white border border-gray-300 rounded-lg shadow-md h-[100%]">
                            <CardContent className="p-8 py-10">
                                {/* <h3 class="text-xl font-semibold">{notification.title}</h3> */}
                                <Badge className="bg-red-200 text-red-600 border border-red-600 px-2 py-[0.2px] rounded-full hover:bg-red-200 mb-2"><p className=" items-center gap-2 text-[10px]">{project.project_status}</p></Badge>
                                <div className="flex content-center justify-between">
                                    <p className="font-semibold text-xl"> {project.title} </p>
                                    <p className="text-xs text-blue-800 my-auto font-normal"> {project.startdate} to {project.enddate}</p>
                                </div>
                                <p className="mt-5 text-gray-700">{project.description}</p>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2" />
                <CarouselNext className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2" />
            </Carousel>:<p>Hang on</p>}
       </div>
    )
}

export default Projects;
