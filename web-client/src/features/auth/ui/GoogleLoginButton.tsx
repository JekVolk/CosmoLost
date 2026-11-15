import { API_URL } from '@/shared/config/env';
import { getCsrfToken } from '@/shared/lib';
import { Button, type ButtonProps } from '@chakra-ui/react';
import type React from 'react';
import { useEffect, useState } from 'react';

export interface GoogleLoginButtonProps extends ButtonProps {
  formStyle?: React.CSSProperties;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  children = 'Sign in with Google',
  formStyle,
  ...buttonProps
}) => {
  const [csrfToken, setCsrfToken] = useState<string | null>(() => getCsrfToken());

  useEffect(() => {
    setCsrfToken(getCsrfToken());
  }, []);

  return (
    <form
      method="POST"
      action={`${API_URL.replace(/\/+$/, '')}/auth/login/google-oauth2/`}
      style={formStyle}
    >
      {csrfToken ? <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} /> : null}
      <Button type="submit" colorPalette="blue" variant="surface" {...buttonProps}>
        {children}
      </Button>
    </form>
  );
};
