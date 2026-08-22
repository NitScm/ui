import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

/**
 * Every page is lazily loaded. The console is small, but the login screen is
 * the one route an unauthenticated visitor reaches, and there is no reason for
 * it to carry the rest of the application with it.
 */
export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · nit',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    title: 'Overview · nit',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    title: 'Tasks · nit',
    loadComponent: () => import('./pages/tasks/tasks').then((m) => m.Tasks),
  },
  {
    path: 'tasks/:id',
    canActivate: [authGuard],
    title: 'Task · nit',
    loadComponent: () => import('./pages/task-detail/task-detail').then((m) => m.TaskDetailPage),
  },
  {
    path: 'audit',
    canActivate: [authGuard],
    title: 'Audit · nit',
    loadComponent: () => import('./pages/audit/audit').then((m) => m.Audit),
  },
  {
    path: 'policy',
    canActivate: [authGuard],
    title: 'Policy · nit',
    loadComponent: () => import('./pages/policy/policy').then((m) => m.Policy),
  },
  { path: '**', redirectTo: '' },
];
