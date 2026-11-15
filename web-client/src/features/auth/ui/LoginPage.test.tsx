import { useAuthStore } from '@/entities/user';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  afterEach(() => {
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  const renderWithChakraAndRouter = (ui: React.ReactElement) => {
    return render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ChakraProvider>,
    );
  };

  it('renders login page heading and google login form with POST action', () => {
    const { container } = renderWithChakraAndRouter(<LoginPage />);

    expect(screen.getByText('CosmoLost Game Hub')).toBeInTheDocument();

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('method')).toBe('POST');
    expect(form?.getAttribute('action')).toBe('/auth/login/google-oauth2/');

    const submitBtn = screen.getByRole('button', { name: /увійти через google/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn.getAttribute('type')).toBe('submit');
  });

  it('includes csrf token hidden input when csrftoken cookie exists', () => {
    document.cookie = 'csrftoken=login-csrf-val; path=/';

    const { container } = renderWithChakraAndRouter(<LoginPage />);

    const csrfInput = container.querySelector(
      'input[name="csrfmiddlewaretoken"]',
    ) as HTMLInputElement | null;
    expect(csrfInput).not.toBeNull();
    expect(csrfInput?.value).toBe('login-csrf-val');
  });
});
