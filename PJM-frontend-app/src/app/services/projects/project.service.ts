import { Injectable } from '@angular/core';
import { Project } from './project.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TaskModel } from '../../services/task/task.model';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user/user.service';
import { map } from 'rxjs/operators';

// Interface pour le payload attendu par le backend
export interface ProjetRequest {
  nom: string;
  description?: string;
  createur: string;
  date_echeance?: Date | string;
}

export interface User {
  name: string,
  role: string,
  projet: number
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private mockProjects: Project[] = [
    { id: 1, createur: 'arthur', nom: 'Projet A', description: 'Hello je suis Jeanne D arc', date_echeance: '28/12/1996' },
  ];

  private usersRoleProjets = new BehaviorSubject<any[]>([]);
  usersRoleProjets$: Observable<any[]> = this.usersRoleProjets.asObservable();

  private nextId = 2;

  // Comme projects[] sont stocké dans les services, on utilise des behaviour subjet pour
  // indiquer la gestion des states.
  public projectsSubject = new BehaviorSubject<Project[]>(this.mockProjects);
  projects$ = this.projectsSubject.asObservable();

  constructor(private http: HttpClient) {}


  addUser(user: any) {
    const currentUser = this.usersRoleProjets.value;
    this.usersRoleProjets.next([...currentUser, user]);
  }

  addTaskToProject(projectId: number, task: TaskModel): void {
    const project = this.mockProjects.find(p => p.id === projectId);
    if (project) {
      if (!project.taches) project.taches = [];
      project.taches.push(task);
      this.projectsSubject.next(this.mockProjects);
      console.log('[Service] Tâche ajoutée au projet', projectId, task);
    }
  }

  getUsersRoledByProjectId(projectId: number): Observable<any> {
    return this.http.get<any>(`/api/projet/users-roled/${projectId}`);
  }

  getProjectById(id: number): Observable<any> {
    return this.http.get<any>(`/api/projet/id/${id}`);
  }

  /**
   * Crée un projet côté backend (POST)
   * @param newProject Les données du projet à créer
   */
  onCreateProject(newProject: any): Observable<any> {
    return this.http.post<any>('/api/projet/create', newProject);
  }

  onDeleteProject(project: Project): Observable<any> {
    console.log('project to delete', project);
    return this.http.delete<any>(`/api/projet/delete/${project.id}`);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<any>('http://localhost:8080/api/projet/all').pipe(
      map(response => response.data)
    );
  }

  setUsersRoleProjets(users: any[]) {
  this.usersRoleProjets.next(users);
}

  updateProject(project: Partial<Project>): Observable<Project[]> {
    const currentProjects = this.projectsSubject.value;
    const existingProject = currentProjects.find((p) => p.id === project.id);

    if (existingProject && project.id !== undefined) {
      const updatedProject = { ...existingProject, ...project };

      const updatedProjects = currentProjects.map((p) =>
        p.id === project.id ? updatedProject : p
      );

      this.projectsSubject.next(updatedProjects);
      return of(updatedProjects);
    }

    return of(currentProjects);
  }

  /**
   * Envoie un projet au backend (POST)
   * @param request Le payload à envoyer au backend
   */
  postProject(request: ProjetRequest): Observable<any> {
    return this.http.post<any>('/api/projet/create', request);
  }

  /**
   * Exemple d'appel complet avec logs pour créer un projet avec un utilisateur récupéré par nom
   */
  createProjectWithUserLog(nomUtilisateur: string, projet: Omit<ProjetRequest, 'createur'>, userService: UserService) {
    userService.getUserByNom(nomUtilisateur).subscribe({
      next: user => {
        if (!user || !user.nom) {
          console.error('[Erreur] Utilisateur non trouvé ou nom manquant', user);
          return;
        }
        const projetRequest: ProjetRequest = {
          ...projet,
          createur: user.nom
        };
        console.log('[Info] Payload envoyé pour création de projet:', projetRequest);
        this.onCreateProject(projetRequest).subscribe({
          next: (response) => {
            if (response && response.success) {
              console.log('[Succès] Projet créé:', response.data);
            } else {
              console.error('[Erreur backend]', response);
            }
          },
          error: (err) => {
            console.error('[Erreur HTTP lors de la création du projet]', err);
          }
        });
      },
      error: err => {
        console.error('[Erreur HTTP lors de la récupération de l\'utilisateur]', err);
      }
    });
  }
}
