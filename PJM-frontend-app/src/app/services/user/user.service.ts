import { Injectable } from '@angular/core';
import { UserModel } from './user.model';
import { RoleModel } from '../role/role.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: UserModel[] = [
    { id: 1, nom: 'Alice', role_app: null, email: 'alice@mail.com', password: '', etat_connexion: true, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: [{ id: 1, nom: 'Admin' }] },
    { id: 2, nom: 'Bob', role_app: null, email: 'bob@mail.com', password: '', etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: [{ id: 2, nom: 'Membre' }] },
    { id: 3, nom: 'Charlie', role_app: null, email: 'charlie@mail.com', password: '', etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: [{ id: 2, nom: 'Membre' }] }
  ];

  constructor(private http: HttpClient) { }

  getUsers(): UserModel[] {
    return this.users;
  }

  addUser(user: UserModel) {
    this.users.push(user);
  }

  removeUser(userId: number) {
    this.users = this.users.filter(u => u.id !== userId);
  }

  updateUserRole(userId: number, newRole: RoleModel) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.roles_projet = [newRole];
    }
  }

  getUserByNom(nom: string): Observable<UserModel> {
    return this.http.get<UserModel>(`/api/utilisateur/nom?nom=${encodeURIComponent(nom)}`);
  }
}
