import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const handleSuccess = (credentialResponse) => {
    console.log("Login Success:", credentialResponse);
    // Send the credentialResponse.tokenId to your backend for verification
  };

  const handleFailure = (error) => {
    console.error("Login Failed:", error);
  };

  return (
    <div>
      <h2>Login with Google</h2>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleFailure}
      />
    </div>
  );
};

export default Login;