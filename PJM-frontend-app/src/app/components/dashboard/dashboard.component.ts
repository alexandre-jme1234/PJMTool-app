import { Component, NgModule, numberAttribute, OnInit } from '@angular/core';
import { Project } from '../../services/projects/project.model';
import { ProjectService } from '../../services/projects/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectComponent } from '../project/project.component';
import { Router } from '@angular/router';
import { TruncatePipe } from '../../shared/truncate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  showModal = false
  projetSelectionne: Project | null = null;
  newProject: Partial<Project> = {
  id: 0,
  nom: '',
  createur: '',
  description: '',
  date_echeance: '',
};

  // CONSTRUCTOR
  constructor(
    private projetService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projetService.projects$.subscribe((projects) => {
      this.projects = projects;
    });
  }


  // METHODES
  onAddProjectClick() {
    this.showModal = true;
  }

  onCancel() {
    this.showModal = false;
    this.resetForm();
  }

  getDetailProject(projet: Project) {
    this.projetSelectionne = projet;
    this.router.navigate(['/projet', projet.id]);
  }

  onCreateProject() {

    if(this.projetSelectionne) {
      this.projetService.updateProject(this.newProject).subscribe(() => {
        this.resetForm();
      });
    } else {
      this.projetService.onCreateProject(this.newProject).subscribe(() => {
        this.showModal = false;
      });
    } 
  }

  removeProject(projet: Project) {
    this.projetService.onDeleteProject(projet).subscribe(() => {
      this.resetForm();
    });
  }

  updateProject(projet: Project){
    this.showModal = true;
    this.projetSelectionne = projet;
    this.newProject = { ...projet};
  }


  // RESET FORM
  resetForm() {
    this.newProject = {
    id: 0,
    nom: '',
    createur: '',
    description: '',
    date_echeance: '',
  };
    this.projetSelectionne = null;
    this.showModal = false;
  }
}
