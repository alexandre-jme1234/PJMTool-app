import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { TaskModel } from './task.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}

  // Créer une tâche liée à un projet
  createTask(tache: any): Observable<any> {
    return this.http.post('/api/tache/create', tache);
  }

  // Récupérer les tâches d'un projet
  getTasksByProject(projetId: number): Observable<TaskModel[]> {
    return this.http.get<any>(`/api/tache/project/${projetId}`).pipe(
      map(response => response.data)
    );
  }

  async getUpdateTask(task: any){
    return await firstValueFrom(this.http.patch('/api/tache/update', task))
  }

  // Mettre à jour une tâche
  updateTask(task: any): Observable<any> {
    return this.http.patch('/api/tache/update', task);
  }

  deleteTask(id: number): Observable<any>{
    return this.http.delete(`http://localhost:8080/api/tache/delete/${id}`)
  }

}
