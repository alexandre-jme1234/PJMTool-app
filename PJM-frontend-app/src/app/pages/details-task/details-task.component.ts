import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task/task.service';
import { TaskModel } from '../../services/task/task.model';
import { ProjectService } from '../../services/projects/project.service';
import { Project } from '../../services/projects/project.model';
import { TaskComponent } from '../../components/task/task.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../../shared/truncate.pipe';

@Component({
  selector: 'app-details-task',
  standalone: true,
  imports: [TaskComponent, CommonModule, FormsModule, TruncatePipe],
  templateUrl: './details-task.component.html',
  styleUrls: ['./details-task.component.css']
})
export class DetailsTaskComponent implements OnInit {
  task: TaskModel | undefined;
  projetNom: string = '';
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const projetId = Number(this.route.snapshot.paramMap.get('projet_id'));
    const tacheId = Number(this.route.snapshot.paramMap.get('tache_id'));
    this.projectService.getProjectById(projetId).subscribe(project => {
      if (project && project.taches) {
        this.task = project.taches.find((t: any) => t.id === tacheId);
        this.projetNom = project.nom;
        this.loading = false;
        if (!this.task) {
          this.error = "Tâche introuvable.";
        }
      } else {
        this.loading = false;
        this.error = "Projet ou tâche introuvable.";
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
