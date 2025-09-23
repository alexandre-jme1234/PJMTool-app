import { Component, NgModule, numberAttribute, OnInit } from '@angular/core';
import { Project } from '../../services/projects/project.model';
import { ProjectService } from '../../services/projects/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectComponent } from '../../components/project/project.component';
import { TaskComponent } from '../../components/task/task.component';
import { Router, RouterLink } from '@angular/router';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { TaskModel } from '../../services/task/task.model';
import { TaskService } from '../../services/task/task.service';
import { TaskOverlayComponent } from '../../components/task-overlay/task-overlay.component';
import { UserModel } from '../../services/user/user.model';
import { ProjetModel } from '../../services/projects/projet.model';
import { PrioriteModel } from '../../services/priorite/priorite.model';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { error } from 'console';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TruncatePipe,
    TaskComponent,
    TaskOverlayComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  showTaskModal = false;
  showModal = false;
  showProjectAlert = false;
  userLogged: UserModel = null;
  // Exemples d'utilisateurs, projet et priorité fictifs pour le formulaire
  user1: UserModel = {
    id: 1,
    nom: 'Laurent',
    role_app: null,
    email: null,
    password: null,
    etat_connexion: false,
    tache_commanditaire: null,
    taches_destinataire: null,
    projets_utilisateur: null,
    projets: null,
    roles_projet: null,
  };
  projet1: ProjetModel = {
    id: 1,
    nom: 'Projet 1',
    description: null,
    date_echeance: null,
    date_creation: null,
    utilisateurs_projet: [],
    projet_taches: [],
    taches: [],
    createur: null,
  };
  priorites: PrioriteModel[] = [
    { id: 1, nom: 'HAUTE' },
    { id: 2, nom: 'MOYENNE' },
    { id: 3, nom: 'BASSE' },
  ];

  newTask: TaskModel = {
    id: 0,
    nom: '',
    destinataire: this.user1,
    projet: this.projet1,
    commanditaire: this.user1,
    date_debut: null,
    date_fin: null,
    priorite: null,
    description: '',
    est_termine: false,
    etat: 'TODO',
  };
  projects: Project[] = [];
  selectedProject: Project | null = null;
  task: TaskModel | undefined;
  newProject: Partial<Project> = {
    id: 0,
    nom: '',
    createur: '',
    description: '',
    date_echeance: '',
    taches: [],
  };
  currentProjet_id = 0;
  selectedTask: TaskModel | null = null;
  isOverlayOpen = false;
  selectedProjectIds: number[] = [];
  tasks: TaskModel[] = [];
  tasksToDelete: TaskModel[] = [];

  constructor(
    private projetService: ProjectService,
    private router: Router,
    private taskService: TaskService,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.projetService.getProjects().subscribe((data) => {
      this.projects = data;
      (this.projetService as any).projects = data;
      // Initialiser taches à [] si ce n'est pas déjà un tableau
      this.projects.forEach((proj) => {
        if (!Array.isArray(proj.taches)) {
          proj.taches = [];
        }
      });

      if(sessionStorage.getItem('loggedUser')) {
        let userStored = sessionStorage.getItem('loggedUser');
        this.userLogged = JSON.parse(userStored)
        console.log(this.userLogged, userStored)
      }
      // Charger les tâches pour chaque projet
      const taskRequests = this.projects.map((proj) =>
        this.taskService.getTasksByProject(proj.id ?? 0)
      );
      forkJoin(taskRequests).subscribe((allTasks) => {
        this.projects.forEach((proj, idx) => {
          proj.taches = allTasks[idx];
        });
      });
    });
  }
  
  setLoggUser(){

    let userLogged = JSON.parse(sessionStorage.getItem('loggedUser'));

    this.userService.getUserById(userLogged.id)
  .pipe(
    map(user => {
      user.etat_connexion = !userLogged.etat_connexion;
      return user;
    })
  )
  .subscribe({
    next: (data) => {
      this.userLogged= data;
      userLogged = data;
      console.log('etat_connexion modifié dans subscribe:', data.etat_connexion);
      console.log('etat_connexion de userLogged local:', userLogged.etat_connexion);
    },
    error: (err) => console.error('Aucun User trouvé via cet id', err.error)
  });

  
  if(this.userLogged.etat_connexion == false) {
    console.log(this.userLogged.etat_connexion, this.userLogged.email);
      this.userService.logout(this.userLogged.email).subscribe({
        next: (data) => {
          console.log('logout effect', data)
          this.userLogged = new UserModel;
          return data
        },
        error: (err) => console.error('error logout', err.error)
      })
      sessionStorage.removeItem('loggedUser');
      this.router.navigate(['login']);
    }

    return console.log('userLogged', userLogged)
    // this.userService.getUserById()
  }

  loadProjects(): void {
    this.projetService.getProjects().subscribe((data) => {
      this.projects = data;
    });
  }

  onSelectProject(projet: Project) {
    this.selectedProject = projet;
    if (projet.id !== undefined) {
      this.loadTasksForProject(projet.id);
    }
  }

  onAddProjectClick() {
    this.showModal = true;
  }

  createProject(): void {
    if (this.newProject.nom && this.newProject.date_echeance) {

      this.showProjectAlert = false;
      
      if(this.userLogged.nom !== undefined) {
        this.newProject.createur = this.userLogged.nom;
      }

      this.projetService.onCreateProject(this.newProject).subscribe({
        next: () => {
          this.loadProjects(); // Recharge la liste depuis le backend
          this.resetNewProject();
          this.showModal = false;
        },
        error: (error) => {
          console.error('[Erreur] Projet non créé:', error);
        },
      });
    } else {
      this.showProjectAlert = true;
    }
  }

  onCancel() {
    this.showModal = false;
    this.resetForm();
  }

  onAddTaskClick() {
    this.showTaskModal = true;
    this.resetTaskForm();
  }

  onCreateTask() {
    // Préparer la requête pour le backend
    const tacheRequest = {
      nom: this.newTask.nom,
      description: this.newTask.description,
      priorite: this.newTask.priorite,
      projet_id: this.selectedProject?.id,
      commanditaire_id: this.newTask.commanditaire?.id,
      destinataire_id: this.newTask.destinataire?.id,
      date_debut: this.newTask.date_debut,
      date_fin: this.newTask.date_fin,
      etat: this.newTask.etat,
    };

    console.log('tacheRequest envoyé au backend:', tacheRequest);
    this.taskService.createTask(tacheRequest).subscribe((response: any) => {
      console.log('Réponse reçue du backend:', response);
      if (this.selectedProject && this.selectedProject.id !== undefined) {
        this.loadTasksForProject(this.selectedProject.id);
      }
      this.showTaskModal = false;
    });
  }

  onCancelTask() {
    this.showTaskModal = false;
    this.resetTaskForm();
  }

  resetTaskForm() {
    this.newTask = {
      id: 0,
      nom: '',
      destinataire: this.user1,
      projet: this.projet1,
      commanditaire: this.user1,
      date_debut: null,
      date_fin: null,
      priorite: null,
      description: '',
      est_termine: false,
      etat: 'TODO',
    };
  }

  getDetailProject(projet: Project) {
    this.selectedProject = projet;
    this.router.navigate(['/projet', projet.id]);
  }

  removeProject(projet: Project) {
    this.projetService.onDeleteProject(projet).subscribe(() => {
      this.loadProjects(); // Recharge la liste depuis le backend
    });
  }

  updateProject(projet: Project) {
    this.showModal = true;
    this.selectedProject = projet;
    this.newProject = { ...projet };
  }

  resetForm() {
    this.newProject = {
      id: 0,
      nom: '',
      createur: '',
      description: '',
      date_echeance: '',
    };
    this.selectedProject = null;
    this.showModal = false;
  }

  resetNewProject(): void {
    this.newProject = {
      id: 0,
      nom: '',
      description: '',
      date_echeance: '',
      taches: [],
    };
  }

  onCommanditaireChange(id: number) {
    this.newTask.commanditaire = { id } as any;
  }

  onDestinataireChange(id: number) {
    this.newTask.destinataire = { id } as any;
  }

  onTaskClick(task: TaskModel) {
    this.selectedTask = task;
    this.isOverlayOpen = true;
  }

  closeTaskDetails() {
    this.selectedTask = null;
    this.isOverlayOpen = false;
  }

  goToProject(id: number) {
    this.router.navigate(['/projet', id]);
  }

  deleteTask(id: number) {
    if (this.selectedProject && this.selectedProject.taches) {
      this.selectedProject.taches = this.selectedProject.taches.filter(
        (t) => t.id !== id
      );
      // Pour la cohérence avec le service et la réactivité, met à jour aussi le service si besoin
      const projectIndex = this.projects.findIndex(
        (p) => p.id === this.selectedProject!.id
      );
      if (projectIndex !== -1) {
        this.projects[projectIndex].taches = this.selectedProject.taches;
      }
      this.projetService.projectsSubject.next(this.projects); // Notifie Angular si besoin
      console.log('[SUPPRESSION] Tâche supprimée, id:', id);
    }
  }

  deleteSelectedTasks() {
    if (!this.selectedProject || !this.selectedProject.taches) return;
  
    const selectedProject = this.selectedProject;
    
    if (!selectedProject.taches) return;

    const projectIndex = this.projects.findIndex(
      (p) => p.id === selectedProject.id
    );

    // Vérification project existe
    if (projectIndex === -1) return;
    console.log('this.tasksToDelete', this.tasksToDelete)
    for (let t of this.tasksToDelete) {
      if (t.id !== null) {
        const taskId = t.id;
        this.taskService.deleteTask(taskId).subscribe({
          next: () => {
            if (!selectedProject.taches) return;
            selectedProject.taches = selectedProject.taches.filter(
              (task) => task.id !== taskId
            );
            // màj dataBinding
            this.projects[projectIndex].taches = selectedProject.taches;
  
            this.projetService.projectsSubject.next(this.projects);
  
            console.log(`Tâche avec id ${taskId} supprimée.`);

            const index = this.tasksToDelete.findIndex(t => t.id === taskId)
            if(index === -1) {
              this.tasksToDelete.splice(index, 1);
            }
          },
          error: (err) => {
            console.error(
              `Erreur lors de la suppression de la tâche avec id ${taskId}:`,
              err
            );
          },
        });
      }
    }
  }
  

  get hasCompletedTasks(): boolean {
    return (
      Array.isArray(this.selectedProject?.taches) &&
      this.selectedProject.taches.some((t) => t.est_termine)
    );
  }

  onTaskCheckboxChange(task: TaskModel, event: any) {
    task.est_termine = event.target.checked;
    let indexTask = this.tasksToDelete.findIndex( t => t === task);

    if(event.target.checked) {
      if(indexTask === -1){
        this.tasksToDelete.push(task)
        console.log('TaskToDelet push', this.tasksToDelete)
      }
    } else if(indexTask !== -1) {
      this.tasksToDelete.splice(indexTask, 1)
      console.log('TaskToDelet slice', this.tasksToDelete)
    }
  }

  onTaskUpdated(updatedTask: TaskModel) {
    if (this.selectedProject && this.selectedProject.taches) {
      const idx = this.selectedProject.taches.findIndex(
        (t) => t.id === updatedTask.id
      );
      if (idx !== -1) {
        this.selectedProject.taches[idx] = { ...updatedTask };
      }
    }
  }

  onProjectCheckboxChange(project: Project, event: any) {
    if (event.target.checked) {
      if (!this.selectedProjectIds.includes(project.id!)) {
        this.selectedProjectIds.push(project.id!);
      }
    } else {
      this.selectedProjectIds = this.selectedProjectIds.filter(
        (id) => id !== project.id
      );
    }
  }

  deleteSelectedProjects() {
    const deleteRequests = this.selectedProjectIds.map((id) =>
      this.http.delete('/api/projet/delete/' + id)
    );

    forkJoin(deleteRequests).subscribe(() => {
      this.loadProjects();
      this.selectedProjectIds = [];
    });
  }

  loadTasksForProject(projetId: number) {
    this.taskService.getTasksByProject(projetId).subscribe((tasks) => {
      this.tasks = tasks;
      if (this.selectedProject && this.selectedProject.id === projetId) {
        this.selectedProject.taches = tasks;
      }
    });
  }
}
