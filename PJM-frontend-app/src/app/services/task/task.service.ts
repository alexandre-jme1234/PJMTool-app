import { Injectable } from '@angular/core';
import { Task } from './task.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

  // VA BIENTOT ETRE UN BEHAVIOUR SUBJECT
  private mockTaches: Task[] = [
    {
      id: 0,
      nom: 'Appeler Laurent',
      destinataire_id: 1,
      projet_id: 1,
      commanditaire_id: 1,
      date_debut: '22',
      date_fin: '33',
      priorite: 'HAUTE',
      description: 'Hello',
    },
  ];

  constructor() {}

   getMocksTaches(): Observable<Task[]> {
    return of(this.mockTaches);
   }
}
