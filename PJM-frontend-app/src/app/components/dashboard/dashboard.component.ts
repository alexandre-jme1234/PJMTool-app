import { Component, NgModule, numberAttribute, OnInit } from '@angular/core';
import { Project } from '../../services/projects/project.model';
import { ProjectService } from '../../services/projects/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Task } from '../../services/task/task.model';
import { TaskService } from '../../services/task/task.service';
import { ProjectComponent } from '../project/project.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  projects: Project[] = [];
  selectedProjectId: number | null = null;
  tasks: Task[] = [];

  showModal = false;
  
  projetSelectionne: Project | null = null;
  
  newProject: Partial<Project> = {
    nom: '',
    createur: '',
    description: '',
    date_echeance: ''
  };
  
  constructor(private projetService: ProjectService, private taskService: TaskService, private router: Router){}


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

  getDetailProject(projet: Project) {
    this.projetSelectionne = projet;
    this.router.navigate(['/project', projet.id]);
  }

}
