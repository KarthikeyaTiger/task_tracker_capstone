// shadcn ui components
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Custom components
import EditProject from "./EditProject"
import DeleteProject from "./DeleteProject"

// Utils
import { useGlobalContext } from "../../context/GlobalContext"

const Projects = ( {project, handleSubmit} ) => {
    const { user } = useGlobalContext()
    const userData = JSON.parse(user)
    const statusCodes = {
        "inProgress": ["In Progress", " bg-blue-900 hover:bg-blue-200"],
        "completed": ["Completed", " bg-green-800 hover:bg-green-200"],
        "notStarted": ["Not Started", " bg-zinc-900 hover:bg-zinc-200"],
        "blocked": ["Blocked", " bg-red-900 hover:bg-red-200"]
    }
    
    return (
        <Card className="bg-white border border-gray-300 rounded-xl h-[100%] min-w-[310px]">
            <CardContent className="p-8">
                <div className="flex justify-between mb-5">
                    <Badge className={("text-white px-2 py-[1px] rounded-full mb-2" + statusCodes[project.project_status][1])}>
                        <p className="items-center gap-2 text-[10px]">{statusCodes[project.project_status][0]}</p>
                    </Badge>
                    {
                        userData.role === "admin"
                        && <div className="space-x-3">
                            <EditProject
                                handleSubmit= {handleSubmit}
                                defaultValues={{
                                    project: {
                                        title: project.title,
                                        description: project.description,
                                        startdate: new Date(project.startdate),
                                        enddate: new Date(project.enddate),
                                        project_status: project.project_status
                                    },
                                    employees: project.employees,

                                }}
                                project_id={project.project_id}
                            />
                            <DeleteProject project_id={project.project_id} />
                        </div>
                    }
                    
                </div>
                <div className="flex content-center justify-between space-x-3">
                    <p className="font-semibold text-xl"> {project.title} </p>
                    <p className="text-xs text-blue-800 my-auto font-normal"> {project.startdate} to {project.enddate}</p>
                </div>
                <p className="mt-5 text-gray-700">{project.description}</p>
            </CardContent>
        </Card>
    )
}

export default Projects;
