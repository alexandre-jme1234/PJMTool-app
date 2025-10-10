import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task/task.service';
import { TaskModel } from '../../services/task/task.model';
import { PermissionService, UserPermissions } from '../../services/permissions/permission.service';
import { FrenchDatePipe } from '../../shared/french-date.pipe';

@Component({
  selector: 'app-task-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, FrenchDatePipe],
  templateUrl: './task-overlay.component.html',
  styleUrl: './task-overlay.component.css'
})
export class TaskOverlayComponent {
  @Input() task: TaskModel | null = null;
  @Input() isOpen = false;
  @Input() userPermissions: UserPermissions | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<any>();
  

  isEditMode = false;
  editTask: TaskModel | undefined = undefined;

  constructor(private taskService: TaskService) {}

  ngOnChanges() {
    // Toujours activer le mode édition quand on ouvre une tâche
    if (this.task && this.isOpen) {
      this.isEditMode = true;
      this.editTask = { ...this.task };
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
      
      serviceCall.subscribe(() => {
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
      });
    }
  }

  cancelEdit() {
    this.close.emit();
  }
}
