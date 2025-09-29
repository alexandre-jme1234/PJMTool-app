import { Injectable } from '@angular/core';
import { RoleModel } from './role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roles: RoleModel[] = [
    { id: 1, nom: 'Admin', ajouter_membre: true, creer_tache: true, assigne_tache: true, maj_tache: true, vue_tache: true, vue_tableau_de_bord: true, etre_notifie: true, vue_historique_modifications: true },
    { id: 2, nom: 'Membre', ajouter_membre: false, creer_tache: true, assigne_tache: true, maj_tache: true, vue_tache: true, vue_tableau_de_bord: true, etre_notifie: true, vue_historique_modifications: false }
  ];

  getRoles(): RoleModel[] {
    return this.roles;
  }

  constructor() { }
}
