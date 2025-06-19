import { Injectable } from '@angular/core';
import { Project } from './project.model';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private mockProjects: Project[] = [
    { id: 1, createur: 'arthur', nom: 'Projet A', description: 'Hello je suis Jeanne D arc', date_echeance: '28/12/1996' },
  ];

  private nextId = 2;

  // Comme projects[] sont stocké dans les services, on utilise des behaviour subjet pour
  // indiquer la gestion des states.
  private projectsSubject = new BehaviorSubject<Project[]>(this.mockProjects);
  projects$ = this.projectsSubject.asObservable();

  constructor() {}

  getProjectById(id: number): Observable<Project> {
    const project = this.mockProjects.find((p) => p.id === id);
    return of(project!);
  }

  onCreateProject(newProject: Partial<Project>): Observable<Project> {
    const createdProject: Project = {
      ...newProject,
      id: this.nextId++,
    } as Project;

    this.mockProjects.push(createdProject);

    // Màj mon Subject
    this.projectsSubject.next(this.mockProjects);
    return of(createdProject);
  }

  onDeleteProject(project: Partial<Project>): Observable<Project[]> {
    const projetsCurrent = this.projectsSubject.value;
    const projectsUpdated = projetsCurrent.filter((p) => p.id !== project.id);
    
    this.mockProjects = projectsUpdated;

    this.projectsSubject.next(projectsUpdated);
    return of(projectsUpdated);
  }

  getProjects(): Observable<Project[]> {
    return this.projects$;
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
}
