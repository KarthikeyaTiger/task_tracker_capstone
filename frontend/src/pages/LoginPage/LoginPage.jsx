import React from 'react';
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';

const CLIENT_ID = "695958764159-rbdkroesu7t6s5jf5935cd77ausfmadt.apps.googleusercontent.com";

const LoginPage = () => {
  const handleLoginSuccess = async (response) => {
    const { tokenId } = response;

    try {
      // Send the tokenId to your FastAPI backend for verification
      const res = await axios.post('http://127.0.0.1:8000/verify-token', { id_token: tokenId });
      console.log('User info from backend:', res.data);
    } catch (error) {
      console.error("Error verifying token:", error);
    }
  };

  const handleLoginFailure = (error) => {
    console.error("Google login failed:", error);
  };

  return (
    <div>
      <h2>Sign in with Google</h2>
      <GoogleLogin
        clientId={CLIENT_ID}
        buttonText="Login with Google"
        onSuccess={handleLoginSuccess}
        onFailure={handleLoginFailure}
        cookiePolicy="single_host_origin"
      />
    </div>
  );
};

export default LoginPage;