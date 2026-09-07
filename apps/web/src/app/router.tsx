import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from '@/features/auth';
import { NotFoundPage } from './not-found-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
