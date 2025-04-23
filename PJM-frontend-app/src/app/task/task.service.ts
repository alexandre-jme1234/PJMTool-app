import { Injectable } from '@angular/core';
import { Task } from './task.model';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:8080/api/taches';

  constructor(private http: HttpClient) { }

  getTaskByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/projet/${projectId}`);
  }

  getTasksByProject(projectId: number): Observable<Task[]> {
    const mockTasks: Task[] = [
      {
        id: 1,
        nom: 'Préparer les maquettes',
        destinataire_id: 3,
        projet_id: projectId,
        commanditaire_id: 1,
        date_debut: '2025-04-10',
        date_fin: '2025-04-15',
        priorite: 'haute',
        description: 'Créer les maquettes Figma pour le dashboard'
      },
      {
        id: 2,
        nom: 'Développer l\'API REST',
        destinataire_id: 4,
        projet_id: projectId,
        commanditaire_id: 1,
        date_debut: '2025-04-16',
        date_fin: '2025-04-20',
        priorite: 'moyenne',
        description: 'Mettre en place les endpoints pour les projets et tâches'
      },
      {
        id: 3,
        nom: 'Tests et intégration',
        destinataire_id: null,
        projet_id: projectId,
        commanditaire_id: null,
        date_debut: '2025-04-21',
        date_fin: '2025-04-23',
        priorite: 'basse',
        description: 'Effectuer des tests unitaires et d’intégration'
      }
    ];

    return of(mockTasks);
  }
}
