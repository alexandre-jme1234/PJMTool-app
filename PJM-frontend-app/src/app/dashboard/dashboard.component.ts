import { Component, NgModule, OnInit } from '@angular/core';
import { Project } from '../projects/project.model';
import { ProjectService } from '../projects/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Task } from '../task/task.model';
import { TaskService } from '../task/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  projects: Project[] = [];
  selectedProjectId: number | null = null;
  tasks: Task[] = [];

  showModal = false;

  constructor(private projetService: ProjectService, private taskService: TaskService){}

  newProject: Partial<Project> = {
    nom: '',
    createur: '',
    description: '',
    date_echeance: ''
  };

  ngOnInit(): void {
    this.projetService.getProjects().subscribe((projects) => {
      this.projects = projects;
    });
  }

  onAddProjectClick() {
    this.showModal = true;
  }

  onCancel() {
    this.showModal = false;
  }

  onCreateProject() {
    const createdProject: Project = {
      ...this.newProject,
      id: Date.now(),
    } as Project;

    this.projects.push(createdProject);
    this.newProject = { nom: '', createur: '', description: '', date_echeance: '' };
    this.showModal = false;
  }

  onSelectProject(projectId: number) {
    this.selectedProjectId = projectId;
    this.taskService.getTasksByProject(projectId).subscribe((data) => {
      this.tasks = data;
    });
  }
}
