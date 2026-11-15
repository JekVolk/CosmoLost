import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { GoogleLoginButton } from './GoogleLoginButton';

describe('GoogleLoginButton', () => {
  afterEach(() => {
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
  };

  it('renders a POST form to /auth/login/google-oauth2/ with a submit button', () => {
    const { container } = renderWithChakra(<GoogleLoginButton />);
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('method')).toBe('POST');
    expect(form?.getAttribute('action')).toBe('/auth/login/google-oauth2/');

    const button = screen.getByRole('button', { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('type')).toBe('submit');
    expect(container.querySelector('input[name="csrfmiddlewaretoken"]')).toBeNull();
  });

  it('includes csrf token hidden input when csrftoken cookie is present', () => {
    document.cookie = 'csrftoken=my-test-csrf-token; path=/';
    const { container } = renderWithChakra(<GoogleLoginButton />);

    const csrfInput = container.querySelector(
      'input[name="csrfmiddlewaretoken"]',
    ) as HTMLInputElement | null;
    expect(csrfInput).not.toBeNull();
    expect(csrfInput?.value).toBe('my-test-csrf-token');
    expect(csrfInput?.type).toBe('hidden');
  });
});
