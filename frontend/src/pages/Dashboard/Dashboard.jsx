import React, { useEffect, useState } from 'react'
import Projects from "@/components/custom/Projects";
import TaskTable from "@/components/custom/TaskTable";
import AddProject from "@/components/custom/AddProject";
import axios from "axios";

const Dashboard = () =>{
    const [taskData, setTaskData] = useState([]);
    const [taskLoading, setTaskLoading] = useState(true);
    const [taskError, setTaskError] = useState(null);

    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://127.0.0.1:8000/task?employee_id=1',
            headers: { }
        };
    
        axios.request(config)
        .then((response) => {
            setTaskData(response.data);
            setTaskLoading(false);
        })
        .catch((e) => {
            setTaskError(e);
            setTaskLoading(false);
        });
    }, [])

    return(
        <div className="mx-auto max-w-[900px] px-6">
            <div className="flex justify-between space-x-3 align-center">
                <p className='text-3xl font-bold my-10'>Dashboard</p>
                <AddProject />
            </div>
            {taskLoading ? <>Loading data</> : 
            (
                taskError ? <div className='text-center'>{taskError.response.data.detail}</div>:<TaskTable data={taskData} />
            )
            }
            <Projects />
        </div>
    )
}

export default Dashboard;