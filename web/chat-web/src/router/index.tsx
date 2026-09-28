import { lazy } from 'react';
import { type RouteObject, useRoutes } from 'react-router';
import MainLayout from '@/layouts/MainLayout';
import RequireAuth from './RequireAuth';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [{ index: true, element: <Home /> }],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];

export default function AppRouter() {
  return useRoutes(routes);
}
