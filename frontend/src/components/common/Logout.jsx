import React from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../../context/GlobalContext';

const Logout = () => {
    const { setUser, setIsAuthenticated, setToken } = useGlobalContext();
    const navigate = useNavigate();
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setToken("");
        localStorage.removeItem("token");
        localStorage.removeItem("user_details")
        navigate("/login")
    }
    return (
        <Button variant="outline" onClick={logout}>Logout</Button>
    )
}

export default Logout
