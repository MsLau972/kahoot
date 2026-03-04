import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./login/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'quiz/:id',
    loadComponent: () =>
      import('./question-detail/quiz-detail.page').then(
        (m) => m.QuizDetailPage,
      ),
  },
  {
    path: 'question-detail',
    loadComponent: () =>
      import('./question-detail/quiz-detail.page').then(
        (m) => m.QuizDetailPage,
      ),
  },
];
