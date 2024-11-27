import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Navigate, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';
import axios from 'axios';

// shadcn ui components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const Login = () => {
  const { setUser, isAuthenticated, setIsAuthenticated, setToken } = useGlobalContext();

  const navigate = useNavigate();
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setToken(tokenResponse.access_token);
      localStorage.setItem("token", tokenResponse.access_token);
      let data = JSON.stringify({
        "token": tokenResponse.access_token
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://127.0.0.1:8000/auth/google',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };

      axios.request(config)
      .then((response) => {
        setIsAuthenticated(true);
        setUser(JSON.stringify(response.data));
        localStorage.setItem("user_details", JSON.stringify(response.data));
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
    },
  });

  return (
    isAuthenticated
      ? (<Navigate to="/" />)
      : (
      <Card className="mx-auto max-w-sm text-center w-[100%]">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Click below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button type="submit" className="w-full" onClick={login}>
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  );
};

export default Login;