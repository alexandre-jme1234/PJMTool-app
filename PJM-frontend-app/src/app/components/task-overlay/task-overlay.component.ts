import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task/task.service';
import { TaskModel } from '../../services/task/task.model';

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
  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<TaskModel>();

  isEditMode = false;
  editTask: TaskModel | undefined = undefined;

  constructor(private taskService: TaskService) {}

  enableEdit(): void {
    this.isEditMode = true;
    this.editTask = this.task ? { ...this.task } : new TaskModel();
  }

  saveEdit() {
    if (this.editTask) {
      this.task = { ...this.editTask };
      const tacheRequest = {
        id: this.editTask.id,
        nom: this.editTask.nom,
        description: this.editTask.description,
        priorite: typeof this.editTask.priorite === 'string' ? this.editTask.priorite : this.editTask.priorite?.nom,
        projet_id: this.editTask.projet?.id,
        commanditaire_id: this.editTask.commanditaire?.id,
        destinataire_id: this.editTask.destinataire?.id,
        date_debut: this.editTask.date_debut,
        date_fin: this.editTask.date_fin,
        est_termine: this.editTask.est_termine
      };
      this.taskService.updateTask(tacheRequest).subscribe(() => {
        this.taskUpdated.emit({
          id: this.editTask?.id ?? null,
          commanditaire: this.editTask?.commanditaire ?? null,
          destinataire: this.editTask?.destinataire ?? null,
          nom: this.editTask?.nom ?? null,
          description: this.editTask?.description ?? null,
          priorite: this.editTask?.priorite ?? null,
          projet: this.editTask?.projet ?? null,
          date_debut: this.editTask?.date_debut ?? null,
          date_fin: this.editTask?.date_fin ?? null,
          est_termine: this.editTask?.est_termine ?? false,
          etat: this.editTask?.etat ?? 'TODO'
        });
        this.isEditMode = false;
      });
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editTask = undefined;
  }
}
