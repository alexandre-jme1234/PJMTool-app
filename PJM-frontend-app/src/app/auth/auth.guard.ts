import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est connecté via AuthService
  if (authService.isLoggedIn) {
    return true;
  }

  // Vérifier si l'utilisateur est connecté via sessionStorage (après rechargement de page)
  const loggedUser = sessionStorage.getItem('loggedUser');
  if (loggedUser) {
    // Restaurer l'état de connexion dans AuthService
    authService.isLoggedIn = true;
    return true;
  }

  // Rediriger vers login si non connecté
  return router.parseUrl('/login');
};
