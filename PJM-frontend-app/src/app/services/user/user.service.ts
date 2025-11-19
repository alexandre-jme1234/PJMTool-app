import { Injectable } from '@angular/core';
import { UserModel } from './user.model';
import { RoleModel } from '../role/role.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public users: UserModel[] = []

  public loggedUser: UserModel = null;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUsers(): Observable<UserModel[]>  {
   return this.http.get<UserModel[]>('http://localhost:8080/api/utilisateur/');
  }

  setUserLogged(user: any) {
    const userStored = sessionStorage.getItem('loggedUser');
    console.log('setUserLogged', user)
    console.log('setUserLogged Stored', userStored)
    
    if(!userStored) {
      this.authService.isLoggedIn = true;
      user.isLoggedIn = true;
      return sessionStorage.setItem('loggedUser', JSON.stringify(user))
    }

      this.authService.isLoggedIn = true;
      user.isLoggedIn = true;
      sessionStorage.clear();
      return sessionStorage.setItem('loggedUser', JSON.stringify(user));
  }

  // getUserById via une fetch et vérifier que la route existe dans le backend
  getUserById(id: string): Observable<any> {
    return this.http.get<string>(`http://localhost:8080/api/utilisateur/${id}`);
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
    return this.http.post<UserModel>('http://localhost:8080/api/utilisateur/create', payload);
  }

  /**
   * Authentification: PATCH /api/utilisateur/login
   */
  login(email: string, password: string): Observable<any> {
    return this.http.patch<any>('http://localhost:8080/api/utilisateur/login', { email, password });
  }

  /**
   * Déconnexion: PATCH /api/utilisateur/logout
   */
  logout(email: string): Observable<any> {
    this.authService.logout();
    sessionStorage.removeItem('loggedUser');
    return this.http.patch<any>('http://localhost:8080/api/utilisateur/logout', { email });
  }

  addUserToProject(user: any, id: number): Observable<any> {
    return this.http.post<any>(`http://localhost:8080/api/utilisateur/add-user-to-project?id=${id}`, user);
  }

  // test

  removeUser(userId: number) {
    this.users = this.users.filter(u => u.id !== userId);
  }

  updateUserRole(userId: number, newRole: RoleModel) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.roles_projet = [newRole];
    }
  }

  //test cicd

  addUserRoledToProject(nom: string, roleId: string | null, projectId: number): Observable<any> {
    console.log('Adding user to project', nom, roleId, projectId);
    return this.http.post<any>(`http://localhost:8080/api/utilisateur/add-user-to-project?id=${projectId}`, { "nom": nom, "role_app": roleId });
  }

  getUserByNom(nom: string): Observable<UserModel> {
    return this.http.get<UserModel>(`http://localhost:8080/api/utilisateur/nom?nom=${encodeURIComponent(nom)}`);
  }
}
