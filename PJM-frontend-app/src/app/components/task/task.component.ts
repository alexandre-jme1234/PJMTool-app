import { Component, Input } from '@angular/core';
import { TaskModel } from '../../services/task/task.model';
import { TaskService } from '../../services/task/task.service';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from '../../services/user/user.service'; 
import { UserModel } from '../../services/user/user.model';
import { forkJoin } from 'rxjs'; 

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})

export class TaskComponent {
  @Input() task?: TaskModel;
  @Input() mode: 'card' | 'detail' = 'card';
  @Input() projectId?: number;

  constructor(private taskService: TaskService,   private userService: UserService,  private router: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    
    if (!this.task && this.mode === 'detail' && this.projectId !== undefined) {
      const id = Number(this.router.snapshot.paramMap.get('id'));
      this.taskService.getTasksByProject(this.projectId).subscribe(tasks => {
        this.task = tasks.find((t: TaskModel) => t.id === id);
      });
      if (this.task) {
        this.enrichUserData();
      }
    } else if (this.task) {
    this.enrichUserData();
  }
  } 

  goBack() {
    this.location.back();
  }

  private enrichUserData(): void {
  if (!this.task) return;

  const requests: any = {};

  // Vérifier si commanditaire est un ID simple (number)
  if (this.task.commanditaire && typeof this.task.commanditaire === 'number') {
    this.userService.getUserById(String(this.task.commanditaire)).subscribe(user => {
      this.task.commanditaire = user;
    });
  }
  // Vérifier si commanditaire est un objet sans nom
  else if (this.task.commanditaire && typeof this.task.commanditaire === 'object' && !this.task.commanditaire.nom) {
    this.userService.getUserById(String(this.task.commanditaire.id)).subscribe(user => {
      this.task.commanditaire = user;
    });
  }

  // Vérifier si destinataire est un ID simple (number)
  if (this.task.destinataire && typeof this.task.destinataire === 'number') {
    this.userService.getUserById(String(this.task.destinataire)).subscribe(user => {
      this.task.destinataire = user;
    });
  }
  // Vérifier si destinataire est un objet sans nom
  else if (this.task.destinataire && typeof this.task.destinataire === 'object' && !this.task.destinataire.nom) {
    this.userService.getUserById(String(this.task.destinataire.id)).subscribe(user => {
      this.task.destinataire = user;
    });
  }

  // Si aucune requête nécessaire, ne rien faire
  if (Object.keys(requests).length === 0) {
    console.log('✓ Utilisateurs déjà complets');
    return;
  }

  // Charger les utilisateurs en parallèle
  forkJoin(requests).subscribe({
    next: (users: any) => {
      if (this.task) {
        if (users.commanditaire) {
          this.task.commanditaire = users.commanditaire as UserModel;
        }
        if (users.destinataire) {
          this.task.destinataire = users.destinataire as UserModel;
        }
      }
    },
    error: (error) => {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  });
   }
}
