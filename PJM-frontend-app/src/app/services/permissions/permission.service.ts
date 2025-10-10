import { Injectable } from '@angular/core';
import { RoleModel } from '../role/role.model';

export interface UserPermissions {
  canAddMember: boolean;
  canCreateTask: boolean;
  canAssignTask: boolean;
  canUpdateTask: boolean;
  canViewTask: boolean;
  canViewDashboard: boolean;
  canBeNotified: boolean;
  canViewHistory: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor() { }

  /**
   * Retourne les permissions d'un utilisateur selon son rôle dans un projet
   * @param roleNom Le nom du rôle (ADMINISTRATEUR, MEMBRE, OBSERVATEUR)
   */
  getPermissionsByRole(roleNom: string | null): UserPermissions {
    const defaultPermissions: UserPermissions = {
      canAddMember: false,
      canCreateTask: false,
      canAssignTask: false,
      canUpdateTask: false,
      canViewTask: true,
      canViewDashboard: true,
      canBeNotified: true,
      canViewHistory: true
    };

    if (!roleNom) {
      return defaultPermissions;
    }

    switch (roleNom.toUpperCase()) {
      case 'ADMINISTRATEUR':
        return {
          canAddMember: true,
          canCreateTask: true,
          canAssignTask: true,
          canUpdateTask: true,
          canViewTask: true,
          canViewDashboard: true,
          canBeNotified: true,
          canViewHistory: true
        };

      case 'MEMBRE':
        return {
          canAddMember: false,
          canCreateTask: true,
          canAssignTask: true,
          canUpdateTask: true,
          canViewTask: true,
          canViewDashboard: true,
          canBeNotified: true,
          canViewHistory: true
        };

      case 'OBSERVATEUR':
        return {
          canAddMember: false,
          canCreateTask: false,
          canAssignTask: false,
          canUpdateTask: false,
          canViewTask: true,
          canViewDashboard: true,
          canBeNotified: true,
          canViewHistory: true
        };

      default:
        return defaultPermissions;
    }
  }

  /**
   * Vérifie si un utilisateur peut effectuer une action spécifique
   */
  canPerformAction(roleNom: string | null, action: keyof UserPermissions): boolean {
    const permissions = this.getPermissionsByRole(roleNom);
    return permissions[action];
  }
}
