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
  @Output() taskUpdated = new EventEmitter<any>();
  

  isEditMode = false;
  editTask: TaskModel | undefined = undefined;

  constructor(private taskService: TaskService) {}

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
        commanditaire_id: 1,
        destinataire_id: 1,
        nom: this.editTask?.nom ?? null,
        description: this.editTask?.description ?? null,
        priorite_id: this.editTask?.priorite,
        projet_id: this.editTask?.projet,
        date_debut: this.editTask?.date_debut ? new Date(this.editTask.date_debut).getTime() : null,
        date_fin: this.editTask?.date_fin ? new Date(this.editTask.date_fin).getTime() : null,
        etat: this.editTask?.etat ?? 'TODO'
      };
      this.taskService.updateTask(tacheRequest).subscribe(() => {
        this.taskUpdated.emit({
          id: this.editTask?.id,
          commanditaire_id: 1,
          destinataire_id: 1,
          nom: this.editTask?.nom ?? null,
          description: this.editTask?.description ?? null,
          priorite_id: this.editTask?.priorite,
          projet_id: this.editTask?.projet,
          date_debut:this.editTask?.date_debut ? new Date(this.editTask.date_debut).getTime() : null,
          date_fin: this.editTask?.date_fin ? new Date(this.editTask.date_fin).getTime() : null,
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
