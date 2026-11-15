import { useAuthStore } from '@/entities/user';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { RequireAuth } from './RequireAuth';

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('redirects to /login if user is not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/game']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/game" element={<div>Protected Game Arena</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Game Arena')).not.toBeInTheDocument();
  });

  it('renders protected child component when token is present', () => {
    useAuthStore.getState().setToken('test-jwt-token');

    render(
      <MemoryRouter initialEntries={['/game']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/game" element={<div>Protected Game Arena</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Game Arena')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
