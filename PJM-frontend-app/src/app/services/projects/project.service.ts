import { Injectable } from '@angular/core';
import { Project } from './project.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private mockProjects: Project[] = [
    { id: 1, createur: "arthur", nom: 'Projet A', date_echeance: '28/12/1996' },
    { id: 1, createur: "arthur", nom: 'Projet B', date_echeance: '22/12/1996' },
  ];

  getProjects(): Observable<Project[]> {
    return of(this.mockProjects);
  }

  constructor() { }

  getProjectById(id: number): Observable<Project> {
    const project = this.mockProjects.find(p => p.id === id);
    return of(project!);
  }
}
