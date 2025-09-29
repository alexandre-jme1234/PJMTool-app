import { Component, Input } from '@angular/core';
import { TaskModel } from '../../services/task/task.model';
import { TaskService } from '../../services/task/task.service';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

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

  constructor(private taskService: TaskService, private router: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    if (!this.task && this.mode === 'detail' && this.projectId !== undefined) {
      const id = Number(this.router.snapshot.paramMap.get('id'));
      this.taskService.getTasksByProject(this.projectId).subscribe(tasks => {
        this.task = tasks.find((t: TaskModel) => t.id === id);
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
