import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task/task.service';
import { TaskModel } from '../../services/task/task.model';
import { PermissionService, UserPermissions } from '../../services/permissions/permission.service';
import { UserModel } from '../../services/user/user.model';

@Component({
  selector: 'app-task-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-overlay.component.html',
  styleUrl: './task-overlay.component.css'
})
export class TaskOverlayComponent {
  @Input() task: TaskModel | null = null;
  @Input() isOpen = false;
  @Input() userPermissions: UserPermissions | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<any>();
  @Input() utilisateursProjet: UserModel[] = [];
  

  isEditMode = false;
  editTask: TaskModel | undefined = undefined;
  
  // Toast properties
  showToast = false;
  toastMessage = '';
  toastType: 'error' | 'success' = 'error';

  constructor(private taskService: TaskService) {}

  ngOnChanges() {
    // Toujours activer le mode édition quand on ouvre une tâche
    if (this.task && this.isOpen) {
      this.isEditMode = true;
      this.editTask = { ...this.task };
      console.log('Task-overlay - Utilisateurs du projet reçus:', this.utilisateursProjet);
    } else {
      this.isEditMode = false;
      this.editTask = undefined;
    }
  }

  enableEdit(): void {
    this.isEditMode = true;
    this.editTask = this.task ? { ...this.task } : new TaskModel();
  }

  saveEdit() {
    if (this.editTask) {
      // Validation: date_debut doit être inférieure à date_fin
      if (this.editTask.date_debut && this.editTask.date_fin) {
        const dateDebut = new Date(this.editTask.date_debut);
        const dateFin = new Date(this.editTask.date_fin);
        
        if (dateDebut >= dateFin) {
          console.error('❌ Erreur: La date de début doit être antérieure à la date de fin');
          this.showToastMessage('La date de début doit être antérieure à la date de fin', 'error');
          return;
        }
      }
      
      console.log('editTask', this.editTask)
      this.task = { ...this.editTask };
      
      const tacheRequest = {
        id: this.editTask?.id,
        commanditaire_id: this.editTask?.commanditaire?.id || 1,
        destinataire_id: this.editTask?.destinataire?.id || 1,
        nom: this.editTask?.nom ?? null,
        description: this.editTask?.description ?? null,
        priorite: this.editTask?.priorite,
        projet_id: this.editTask?.projet?.id,
        date_debut: this.editTask?.date_debut,
        date_fin: this.editTask?.date_fin,
        etat: this.editTask?.etat ?? 'TODO'
      };
      
      // Si id === 0, c'est une création, sinon c'est une modification
      const serviceCall = this.editTask.id === 0 
        ? this.taskService.createTask(tacheRequest)
        : this.taskService.updateTask(tacheRequest);
      
      serviceCall.subscribe({
        next: () => {
          this.taskUpdated.emit({
            id: this.editTask?.id,
            commanditaire_id: this.editTask?.commanditaire?.id || 1,
            destinataire_id: this.editTask?.destinataire?.id || 1,
            nom: this.editTask?.nom ?? null,
            description: this.editTask?.description ?? null,
            priorite_id: this.editTask?.priorite,
            projet_id: this.editTask?.projet?.id,
            date_debut:this.editTask?.date_debut ? new Date(this.editTask.date_debut).getTime() : null,
            date_fin: this.editTask?.date_fin ? new Date(this.editTask.date_fin).getTime() : null,
            etat: this.editTask?.etat ?? 'TODO'
          });
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la tâche:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.close.emit();
  }

  // Fonction de comparaison pour le select des utilisateurs
  compareUsers(user1: UserModel | null, user2: UserModel | null): boolean {
    return user1?.id === user2?.id;
  }

  // Afficher un toast
  showToastMessage(message: string, type: 'error' | 'success' = 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Masquer automatiquement après 3 secondes
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
