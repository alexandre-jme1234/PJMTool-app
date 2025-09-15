import { Injectable } from '@angular/core';
import { UserModel } from './user.model';
import { RoleModel } from '../role/role.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  /**
   * Création d'utilisateur (inscription côté backend)
   * Accepte soit un Partial<UserModel>, soit un objet { uid?, email, displayName?, password?, role_app? }
   * utilisé par le composant signin-up.
   */
  addUser(user: Partial<UserModel> | { uid?: string; email?: string; displayName?: string; password?: string; role_app?: string; nom?: string; }): Observable<UserModel>  {
    const payload = {
      email: user.email,
      etat_connexion: 1,
      nom: (user as any).nom ?? (user as any).displayName ?? '',
      password: (user as any).password ?? '',
      role_app: (user as any).role_app ?? 'MEMBRE'
    };
    return this.http.post<UserModel>('/api/utilisateur/create', payload);
  }

  /**
   * Authentification: PATCH /api/utilisateur/login
   */
  login(email: string, password: string): Observable<any> {
    return this.http.patch<any>('/api/utilisateur/login', { email, password });
  }

  /**
   * Déconnexion: PATCH /api/utilisateur/logout
   */
  logout(email: string): Observable<any> {
    return this.http.patch<any>('/api/utilisateur/logout', { email });
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
