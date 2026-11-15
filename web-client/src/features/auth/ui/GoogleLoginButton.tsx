import React from 'react';
import { Button } from '@chakra-ui/react';

export const GoogleLoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/login/google-oauth2/';
  };

  return (
    <Button colorPalette="blue" variant="surface" onClick={handleLogin}>
      Увійти через Google
    </Button>
  );
};
