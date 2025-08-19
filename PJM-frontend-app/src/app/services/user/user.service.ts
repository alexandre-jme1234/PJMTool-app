import { Injectable } from '@angular/core';
import { UserModel } from './user.model';
import { RoleModel } from '../role/role.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { error } from 'node:console';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public users: UserModel[] = []

  constructor(private http: HttpClient) { }

  getUsers(): Observable<UserModel[]>  {
   return this.http.get<UserModel[]>('/api/utilisateur/');
  }

  // getUserById via une fetch et vérifier que la route existe dans le backend
  getUserById(id: string): Observable<any> {
    return this.http.get<string>(`/api/utilisateur/${id}`);
  }

  addUser(user: Partial<UserModel>) {
    console.log('user', user)
    this.http.post<UserModel>('/api/utilisateur/create', {
      "email": user.email,
      "etat_connexion": 1,
      "nom": user.nom,
      "password": user.password,
      "role_app": user.role_app
    }).subscribe({
      next: (createdUser: UserModel) => {
        console.log('Utilisateur créé avec succès :', createdUser);
      },
      error: (error) => {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
      }
    });
  }

  addUserToProject(user: any, id: number): Observable<any> {
    return this.http.post<any>(`/api/utilisateur//add-user-to-project?id=${id}`, user);
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
