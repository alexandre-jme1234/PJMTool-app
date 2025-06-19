import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../../services/projects/project.model';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/projects/project.service';
import { Router } from '@angular/router';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task/task.service';
import { Task } from '../../services/task/task.model';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, TruncatePipe, FormsModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent implements OnInit {
  // INPUT DE DASHBOARD
  @Input() projet: Project | undefined;

  taches: Task[] = [];

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjectService,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projetService.getProjectById(id).subscribe((data) => {
      this.projet = data;
    });

    // MOCK TEST DE TACHES
    this.taskService.getMocksTaches().subscribe((data) => {
      this.taches = data;
    });
  }

  goMainPage() {
    this.router.navigate(['']);
  }
}
