import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Project } from '../../services/projects/project.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/projects/project.service';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task/task.service';
import { TaskModel } from '../../services/task/task.model';
import { TaskComponent } from '../task/task.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskOverlayComponent } from '../task-overlay/task-overlay.component';
import { PrioriteModel } from '../../services/priorite/priorite.model';
import { UserService } from '../../services/user/user.service';
import { RoleService } from '../../services/role/role.service';
import { UserModel } from '../../services/user/user.model';
import { RoleModel } from '../../services/role/role.model';
import { ProjetModel } from '../../services/projects/projet.model';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, TruncatePipe, FormsModule, TaskComponent, DragDropModule, TaskOverlayComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent implements OnInit {
  @Input() projet: ProjetModel | null = null;
  prioriteHaute: PrioriteModel = { id: 1, nom: 'HAUTE' };
  prioriteMoyenne: PrioriteModel = { id: 2, nom: 'MOYENNE' };
  prioriteBasse: PrioriteModel = { id: 3, nom: 'BASSE' };
  selectedTask: TaskModel | null = null;
  isOverlayOpen = false;
  utilisateursProjet: UserModel[] = [];
  rolesDisponibles: RoleModel[] = [];
  nouvelUtilisateurId: number | undefined = undefined;
  editionRoleId: number | null = null;
  roleSelectionne: { [userId: number]: number } = {};
  allUsers: UserModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjectService,
    private router: Router,
    private taskService: TaskService,
    public userService: UserService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projetService.getProjectById(id).subscribe((response: any) => {
      console.log('Réponse projet backend:', response);
      const data = response.data;
      if (data) {
        if ('utilisateurs_projet' in data) {
          this.projet = data as ProjetModel;
          console.log('Tâches du projet:', this.projet.taches);
          this.utilisateursProjet = this.projet.utilisateurs_projet || [];
        } else {
          this.projet = {
            ...data,
            utilisateurs_projet: [],
            taches: data.taches || [],
            createur: null,
            date_creation: null,
            projet_taches: []
          } as ProjetModel;
          this.utilisateursProjet = [];
        }
        // Charger les tâches du backend
        this.taskService.getTasksByProject(id).subscribe(tasks => {
          if (this.projet) {
            this.projet.taches = tasks.map((t: any) => ({
              ...t,
              etat: t.etat || 'TODO'
            }));
          }
        });
      } else {
        this.projet = null;
        this.utilisateursProjet = [];
        console.warn('Aucun projet trouvé pour cet id');
      }
    });
    this.rolesDisponibles = this.roleService.getRoles();
    this.allUsers = this.userService.getUsers();
  }

  get tachesTodo(): TaskModel[] {
    return this.projet?.taches?.filter(t => t.etat === 'TODO') || [];
  }
  get tachesInProgress(): TaskModel[] {
    return this.projet?.taches?.filter(t => t.etat === 'IN_PROGRESS') || [];
  }
  get tachesDone(): TaskModel[] {
    return this.projet?.taches?.filter(t => t.etat === 'DONE') || [];
  }

  onTaskClick(task: TaskModel) {
    this.selectedTask = task;
    this.isOverlayOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeTaskDetails() {
    this.selectedTask = null;
    this.isOverlayOpen = false;
    document.body.style.overflow = '';
  }

  goMainPage() {
    this.router.navigate(['']);
  }

  deleteTask(id: number) {
    if (!this.projet?.taches) return;
    this.projet.taches = this.projet.taches.filter(t => t.id !== id);
  }
  
  async onTaskDrop(event: CdkDragDrop<TaskModel[]>, etat: 'TODO' | 'IN_PROGRESS' | 'DONE', nouvellePriorite: PrioriteModel) {
    if (!this.projet?.taches) return;
    if (!Array.isArray(event.previousContainer.data) || !Array.isArray(event.container.data)) return;
    type EtatState = 'TODO' | 'IN_PROGRESS' | 'DONE'

    const dictEventEtat: Record<string, EtatState> = {todoList: 'TODO', inProgressList: 'IN_PROGRESS', doneList: 'DONE'};
  
    function getEtatByEvent(eventContainer: string): EtatState | null{
      const state = dictEventEtat[eventContainer];
      if(state != null){
        return state
      }
      
      return null
    }

    let etatEvent = getEtatByEvent(event.container.id);
    const task: TaskModel = event.previousContainer.data[event.previousIndex];
    if (!task) return;

    // Met à jour l'état et la priorité
    
    
    task.etat = etatEvent as string;
    if (task.priorite?.nom !== nouvellePriorite.nom) {
      task.priorite = nouvellePriorite;
    }

    // // Envoie la modification au backend

    console.log('task to update __>', task)
    this.taskService.updateTask(task).subscribe(
      res => res
    );

    if (this.projet && this.projet.id != null) {
      this.taskService.getTasksByProject(this.projet.id).subscribe(tasks => {
        this.projet!.taches = tasks;
        console.log('res task update && get list task __>', tasks)
      });
    }


    // Déplace la tâche dans le tableau cible (ordre visuel)
    event.previousContainer.data.splice(event.previousIndex, 1);
    event.container.data.splice(event.currentIndex, 0, task);
  }

  public trackByTaskId(index: number, task: TaskModel): number | null {
    return task.id ?? null;
  }

  getUserRole(user: UserModel): RoleModel | undefined {
    return user.roles_projet && user.roles_projet.length > 0 ? user.roles_projet[0] : undefined;
  }

  modifierRole(user: UserModel) {
    if (user.id == null) return;
    this.editionRoleId = user.id;
    const id = user.id;
    this.roleSelectionne[id] = this.getUserRole(user)?.id ?? (this.rolesDisponibles[0]?.id ?? 0);
  }

  validerRole(user: UserModel) {
    if (user.id == null) return;
    const id = user.id;
    const nouveauRole = this.rolesDisponibles.find(r => r.id === Number(this.roleSelectionne[id]));
    if (nouveauRole) {
      console.log('[validerRole] Utilisateur:', user, 'Nouveau rôle validé:', nouveauRole);
      this.userService.updateUserRole(id, nouveauRole);
      const idx = this.utilisateursProjet.findIndex(u => u.id === id);
      if (idx !== -1) {
        const updatedUser = { ...user, roles_projet: [nouveauRole] };
        this.utilisateursProjet = [
          ...this.utilisateursProjet.slice(0, idx),
          updatedUser,
          ...this.utilisateursProjet.slice(idx + 1)
        ];
        this.cdr.detectChanges();
      }
    }
    this.editionRoleId = null;
  }

  annulerEditionRole() {
    this.editionRoleId = null;
  }

  supprimerUtilisateur(user: UserModel) {
    this.utilisateursProjet = this.utilisateursProjet.filter(u => u.id !== user.id);
    console.log('[supprimerUtilisateur] Utilisateur supprimé:', user);
  }

  ajouterUtilisateur() {
    if (this.nouvelUtilisateurId !== undefined) {
      const user = this.allUsers.find(u => u.id === this.nouvelUtilisateurId);
      if (user && !this.utilisateursProjet.some(u => u.id === user.id)) {
        const userToAdd = { ...user, roles_projet: user.roles_projet ? [...user.roles_projet] : [] };
        this.utilisateursProjet.push(userToAdd);
        console.log('[ajouterUtilisateur] Utilisateur ajouté:', userToAdd);
        this.cdr.detectChanges();
      }
      this.nouvelUtilisateurId = undefined;
    }
  }

  isUserInProject(userId: number | undefined): boolean {
    if (userId === undefined) return false;
    return this.utilisateursProjet.some(u => u.id === userId);
  }
}
