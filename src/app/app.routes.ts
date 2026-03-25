import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard';

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
  {
    path: 'lobby/:gameId',
    loadComponent: () => import('./lobby/lobby.page').then((m) => m.LobbyPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'game/:id',
    loadComponent: () => import('./game/game.page').then(m => m.GamePage),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'account-infos',
    loadComponent: () => import('./account-infos/account-infos.page').then( m => m.AccountInfosPage)
  },
];
