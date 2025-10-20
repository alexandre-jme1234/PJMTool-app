import { TestBed } from '@angular/core/testing';
import { PermissionService, UserPermissions } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPermissionsByRole - ADMINISTRATEUR', () => {
    let permissions: UserPermissions;

    beforeEach(() => {
      permissions = service.getPermissionsByRole('ADMINISTRATEUR');
    });

    it('devrait avoir toutes les permissions à true', () => {
      expect(permissions.canAddMember).toBe(true);
      expect(permissions.canCreateTask).toBe(true);
      expect(permissions.canAssignTask).toBe(true);
      expect(permissions.canUpdateTask).toBe(true);
      expect(permissions.canViewTask).toBe(true);
      expect(permissions.canViewDashboard).toBe(true);
      expect(permissions.canBeNotified).toBe(true);
      expect(permissions.canViewHistory).toBe(true);
    });

    it('devrait fonctionner avec différentes casses', () => {
      const permsLower = service.getPermissionsByRole('administrateur');
      const permsUpper = service.getPermissionsByRole('ADMINISTRATEUR');
      const permsMixed = service.getPermissionsByRole('AdMiNiStRaTeUr');

      expect(permsLower).toEqual(permsUpper);
      expect(permsMixed).toEqual(permsUpper);
    });
  });

  describe('getPermissionsByRole - MEMBRE', () => {
    let permissions: UserPermissions;

    beforeEach(() => {
      permissions = service.getPermissionsByRole('MEMBRE');
    });

    it('devrait pouvoir créer et modifier des tâches', () => {
      expect(permissions.canCreateTask).toBe(true);
      expect(permissions.canAssignTask).toBe(true);
      expect(permissions.canUpdateTask).toBe(true);
    });

    it('ne devrait pas pouvoir ajouter des membres', () => {
      expect(permissions.canAddMember).toBe(false);
    });

    it('devrait avoir les permissions de lecture', () => {
      expect(permissions.canViewTask).toBe(true);
      expect(permissions.canViewDashboard).toBe(true);
      expect(permissions.canBeNotified).toBe(true);
      expect(permissions.canViewHistory).toBe(true);
    });
  });

  describe('getPermissionsByRole - OBSERVATEUR', () => {
    let permissions: UserPermissions;

    beforeEach(() => {
      permissions = service.getPermissionsByRole('OBSERVATEUR');
    });

    it('ne devrait avoir que les permissions de lecture', () => {
      expect(permissions.canAddMember).toBe(false);
      expect(permissions.canCreateTask).toBe(false);
      expect(permissions.canAssignTask).toBe(false);
      expect(permissions.canUpdateTask).toBe(false);
      expect(permissions.canViewTask).toBe(true);
      expect(permissions.canViewDashboard).toBe(true);
      expect(permissions.canBeNotified).toBe(true);
      expect(permissions.canViewHistory).toBe(true);
    });

    it('devrait être le rôle le plus restrictif', () => {
      const adminPerms = service.getPermissionsByRole('ADMINISTRATEUR');
      const membrePerms = service.getPermissionsByRole('MEMBRE');
      const observateurPerms = service.getPermissionsByRole('OBSERVATEUR');

      // Compter les permissions true
      const countTrue = (perms: UserPermissions) => 
        Object.values(perms).filter(v => v === true).length;

      expect(countTrue(observateurPerms)).toBeLessThan(countTrue(membrePerms));
      expect(countTrue(membrePerms)).toBeLessThan(countTrue(adminPerms));
    });
  });

  describe('getPermissionsByRole - Cas limites', () => {
    it('devrait retourner les permissions par défaut pour un rôle null', () => {
      const permissions = service.getPermissionsByRole(null);

      expect(permissions.canAddMember).toBe(false);
      expect(permissions.canCreateTask).toBe(false);
      expect(permissions.canAssignTask).toBe(false);
      expect(permissions.canUpdateTask).toBe(false);
      expect(permissions.canViewTask).toBe(true);
      expect(permissions.canViewDashboard).toBe(true);
      expect(permissions.canBeNotified).toBe(true);
      expect(permissions.canViewHistory).toBe(true);
    });

    it('devrait retourner les permissions par défaut pour un rôle inconnu', () => {
      const permissions = service.getPermissionsByRole('ROLE_INEXISTANT');

      expect(permissions.canAddMember).toBe(false);
      expect(permissions.canCreateTask).toBe(false);
      expect(permissions.canAssignTask).toBe(false);
      expect(permissions.canUpdateTask).toBe(false);
      expect(permissions.canViewTask).toBe(true);
    });

    it('devrait gérer une chaîne vide', () => {
      const permissions = service.getPermissionsByRole('');

      expect(permissions).toBeDefined();
      expect(permissions.canViewTask).toBe(true);
    });
  });

  describe('canPerformAction', () => {
    it('devrait retourner true si l\'administrateur peut ajouter un membre', () => {
      const result = service.canPerformAction('ADMINISTRATEUR', 'canAddMember');
      expect(result).toBe(true);
    });

    it('devrait retourner false si le membre ne peut pas ajouter un membre', () => {
      const result = service.canPerformAction('MEMBRE', 'canAddMember');
      expect(result).toBe(false);
    });

    it('devrait retourner true si l\'observateur peut voir les tâches', () => {
      const result = service.canPerformAction('OBSERVATEUR', 'canViewTask');
      expect(result).toBe(true);
    });

    it('devrait retourner false si l\'observateur ne peut pas créer de tâches', () => {
      const result = service.canPerformAction('OBSERVATEUR', 'canCreateTask');
      expect(result).toBe(false);
    });

    it('devrait gérer un rôle null', () => {
      const result = service.canPerformAction(null, 'canViewTask');
      expect(result).toBe(true);
    });

    it('devrait tester toutes les actions pour ADMINISTRATEUR', () => {
      const actions: (keyof UserPermissions)[] = [
        'canAddMember',
        'canCreateTask',
        'canAssignTask',
        'canUpdateTask',
        'canViewTask',
        'canViewDashboard',
        'canBeNotified',
        'canViewHistory'
      ];

      actions.forEach(action => {
        const result = service.canPerformAction('ADMINISTRATEUR', action);
        expect(result).toBe(true, `ADMINISTRATEUR devrait pouvoir ${action}`);
      });
    });
  });

  describe('Hiérarchie des rôles', () => {
    it('ADMINISTRATEUR devrait avoir plus de permissions que MEMBRE', () => {
      const adminPerms = service.getPermissionsByRole('ADMINISTRATEUR');
      const membrePerms = service.getPermissionsByRole('MEMBRE');

      expect(adminPerms.canAddMember).toBe(true);
      expect(membrePerms.canAddMember).toBe(false);
    });

    it('MEMBRE devrait avoir plus de permissions que OBSERVATEUR', () => {
      const membrePerms = service.getPermissionsByRole('MEMBRE');
      const observateurPerms = service.getPermissionsByRole('OBSERVATEUR');

      expect(membrePerms.canCreateTask).toBe(true);
      expect(observateurPerms.canCreateTask).toBe(false);
    });

    it('tous les rôles devraient pouvoir voir les tâches', () => {
      const roles = ['ADMINISTRATEUR', 'MEMBRE', 'OBSERVATEUR'];

      roles.forEach(role => {
        const perms = service.getPermissionsByRole(role);
        expect(perms.canViewTask).toBe(true, `${role} devrait pouvoir voir les tâches`);
      });
    });
  });

  describe('Cohérence des permissions', () => {
    it('les permissions devraient être cohérentes entre getPermissionsByRole et canPerformAction', () => {
      const role = 'MEMBRE';
      const permissions = service.getPermissionsByRole(role);

      Object.keys(permissions).forEach(key => {
        const action = key as keyof UserPermissions;
        const fromGetPermissions = permissions[action];
        const fromCanPerform = service.canPerformAction(role, action);

        expect(fromGetPermissions).toBe(fromCanPerform, 
          `Incohérence pour ${role}.${action}`);
      });
    });
  });
});
