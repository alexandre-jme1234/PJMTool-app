import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { TaskModel } from './task.model';
import { map, tap } from 'rxjs/operators';
import { TaskHistory, TaskHistoryEvent } from './task-history.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}

  // Créer une tâche liée à un projet
  createTask(tache: any): Observable<any> {
    return this.http.post('http://localhost:8080/api/tache/create', tache).pipe(
      tap((response: any) => {
        // Logger la création dans l'historique
        TaskHistory.addEvent({
          taskId: response.data?.id || response.id,
          taskName: tache.nom,
          eventType: 'CREATION',
          newValue: `Créée avec priorité ${tache.priorite?.nom || 'FAIBLE'}`,
          priorite: tache.priorite?.nom || 'FAIBLE'
        });
      })
    );
  }

  // Récupérer les tâches d'un projet
  getTasksByProject(projetId: number): Observable<TaskModel[]> {
    return this.http.get<any>(`http://localhost:8080/api/tache/project/${projetId}`).pipe(
      map(response => response.data)
    );
  }

  async getUpdateTask(task: any){
    return await firstValueFrom(this.http.patch('http://localhost:8080/api/tache/update', task))
  }

  // Logger un changement d'état
  logEtatChange(taskId: number, taskName: string, oldEtat: string, newEtat: string, priorite: string): void {
    const etatLabels: { [key: string]: string } = {
      'TODO': 'À faire',
      'IN_PROGRESS': 'En cours',
      'DONE': 'Terminée'
    };

    TaskHistory.addEvent({
      taskId,
      taskName,
      eventType: 'ETAT_CHANGE',
      oldValue: etatLabels[oldEtat] || oldEtat,
      newValue: etatLabels[newEtat] || newEtat,
      priorite
    });
  }

  // Logger un changement de priorité
  logPrioriteChange(taskId: number, taskName: string, oldPriorite: string, newPriorite: string): void {
    TaskHistory.addEvent({
      taskId,
      taskName,
      eventType: 'PRIORITE_CHANGE',
      oldValue: oldPriorite,
      newValue: newPriorite,
      priorite: newPriorite
    });
  }

  // Récupérer l'historique d'un projet
  getProjectHistory(projectId: number, tasks: TaskModel[]): TaskHistoryEvent[] {
    return TaskHistory.getEventsByPriority(projectId, tasks);
  }

  // Mettre à jour une tâche
  updateTask(task: any): Observable<any> {
    return this.http.patch('http://localhost:8080/api/tache/update', task);
  }

  deleteTask(id: number): Observable<any>{
    return this.http.delete(`http://localhost:8080/api/tache/delete/${id}`)
  }

}
