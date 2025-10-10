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
import { log } from 'node:console';
import { forkJoin, map, Observable, tap } from 'rxjs';

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
  utilisateursProjet: any[] = [];
  rolesDisponibles: RoleModel[] = [];
  nouvelUtilisateurId: number | undefined = undefined;
  editUser: Partial<UserModel> = {};
  roleSelectionne: { [userId: number]: number } = {};
  allUsers: UserModel[] = [];
  isEditMode = false;
  // selectedUser: any;
  usersAjoutes: { nom: string, id: number }[] = [];
  id!: number;
  newUserEmail: string = '';
  newUserRole: string = '';

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
    this.id = id;

    
    this.projetService.getProjectById(id).subscribe((response: any) => {
      console.log('Réponse projet backend:', response);
      const data = response.data;
      if (data) {
        if ('utilisateurs_projet' in data) {
          this.projet = data as ProjetModel;
          console.log('Tâches du projet:', this.projet.taches);
          this.utilisateursProjet = this.projet.utilisateurs_projet || [];
          console.log('Utilisateurs Projet', this.utilisateursProjet)

          for(let i in this.utilisateursProjet) {
            console.log('i', i)
            if(i){
              this.userService.getUserById(i).subscribe(
                res => {
                  this.utilisateursProjet.push(res)
                  parseInt(i)
                  let index = this.utilisateursProjet.findIndex(num => num == i);
                  if(index > -1){
                    this.utilisateursProjet.splice(index, 1);
                  }
                  console.log('clean utilisateur projet', this.utilisateursProjet);
                }
              )
            }
          }
          
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
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users
        console.log('Utilisateur trouvés :', this.allUsers)
      },
      error: (err) => {
        console.log('Erreur de récupération des utilisateurs :', err)
      }
    });

    this.getUserRoledByProject(id);

    // this.projetService.usersRoleProjets$.subscribe(users => {
    //   console.log('users projets', users)
    //   return this.utilisateursProjet = users
    // })
  }

  enableEdit() {
    this.isEditMode = !this.isEditMode;
  }

  onTaskClick(task: TaskModel) {
    this.selectedTask = task;
    this.isOverlayOpen = true;
    document.body.style.overflow = 'hidden';
  }

  getUtilisateurByEmail(email: string): UserModel | undefined {
    return this.allUsers.find(user => user.email === email);
  }

  getRoleById(roleId: number | null): RoleModel | undefined {
    return this.rolesDisponibles.find(role => role.id === roleId);
  }

  addUserRoledToProject(email: string, role: string | null) {
    const user = this.getUtilisateurByEmail(email);
    if (user && role) {
      this.userService.addUserRoledToProject(user.nom, role, this.projet.id).subscribe({
        next: (response) => {
          console.log('[Succès] Utilisateur ajouté au projet avec rôle:', response);
          // Recharger la liste des utilisateurs du projet
          this.getUserRoledByProject(this.projet.id);
          // Réinitialiser les champs du formulaire
          this.newUserEmail = '';
          this.newUserRole = '';
        },
        error: (error) => {
          console.error('[Erreur] Impossible d\'ajouter l\'utilisateur au projet:', error);
        }
      });
    }
  }

  closeTaskDetails() {
    this.selectedTask = null;
    this.isOverlayOpen = false;
    document.body.style.overflow = '';
  }

  goMainPage() {
    this.router.navigate(['']);
  }

  saveEdit() {
    if(this.editUser) {
      this.userService.addUser(this.editUser);
    }
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

  getUserRoledByProject(projectId: number): any {
    const roleMapping: { [key: number]: string } = {
      1: "ADMINISTRATEUR",
      2: "MEMBRE",
      3: "OBSERVATEUR"
    };

    this.projetService.getUsersRoledByProjectId(projectId)
      .pipe(
        tap(response => console.log('Réponse complète backend:', response)),
        
        // Mapper les données backend vers des utilisateurs complets avec rôles
        map(response => {
          const userRoleData = response.data;
          
          // Pour chaque relation UserRoleProjet, trouver l'utilisateur correspondant
          const usersWithRoles = userRoleData
            .map((urp: any) => {
              // Trouver l'utilisateur complet dans allUsers par son ID
              const user = this.allUsers.find(u => u.id === urp.utilisateur);
              
              if (user) {
                // Créer une copie de l'utilisateur avec le rôle assigné
                return {
                  ...user,
                  role_app: roleMapping[urp.role] || 'OBSERVATEUR'
                };
              }
              return null;
            })
            .filter((user: any) => user !== null); // Retirer les null
          
          console.log('Utilisateurs avec rôles mappés:', usersWithRoles);
          return usersWithRoles;
        })
      )
      .subscribe({
        next: (usersWithRoles) => {
          this.utilisateursProjet = usersWithRoles;
          console.log('Utilisateurs du projet affichés:', this.utilisateursProjet);
        },
        error: (error) => console.error('Erreur lors du filtrage des utilisateurs:', error)
      });
  }

  modifierRole(user: UserModel) {
    if (user.id == null) return;
    const id = user.id;
    this.roleSelectionne[id] = this.getUserRole(user)?.id ?? (this.rolesDisponibles[0]?.id ?? 0);
  }

  // validerRole(user: UserModel) {
  //   if (user.id == null) return;
  //   const id = user.id;
  //   const nouveauRole = this.rolesDisponibles.find(r => r.id === Number(this.roleSelectionne[id]));
  //   if (nouveauRole) {
  //     console.log('[validerRole] Utilisateur:', user, 'Nouveau rôle validé:', nouveauRole);
  //     this.userService.updateUserRole(id, nouveauRole);
  //     const idx = this.utilisateursProjet.findIndex(u => u.id === id);
  //     if (idx !== -1) {
  //       const updatedUser = { ...user, roles_projet: [nouveauRole] };
  //       this.utilisateursProjet = [
  //         ...this.utilisateursProjet.slice(0, idx),
  //         updatedUser,
  //         ...this.utilisateursProjet.slice(idx + 1)
  //       ];
  //       this.cdr.detectChanges();
  //     }
  //   }
  // }

  // supprimerUtilisateur(user: UserModel) {
  //   this.utilisateursProjet = this.utilisateursProjet.filter(u => u.id !== user.id);
  //   console.log('[supprimerUtilisateur] Utilisateur supprimé:', user);
  // }

  // ajouterUtilisateur() {
  //   if (this.nouvelUtilisateurId !== undefined) {
  //     const user = this.allUsers.find(u => u.id === this.nouvelUtilisateurId);
  //     if (user && !this.utilisateursProjet.some(u => u.id === user.id)) {
  //       const userToAdd = { ...user, roles_projet: user.roles_projet ? [...user.roles_projet] : [] };
  //       this.utilisateursProjet.push(userToAdd);
  //       console.log('[ajouterUtilisateur] Utilisateur ajouté:', userToAdd);
  //       this.cdr.detectChanges();
  //     }
  //     this.nouvelUtilisateurId = undefined;
  //   }
  // }

  // isUserInProject(userId: number | undefined): boolean {
  //   if (userId === undefined) return false;
  //   return this.utilisateursProjet.some(u => u.id === userId);
  // }

  get tachesTodo(): TaskModel[] {
    return this.projet?.taches?.filter(t => t.etat === 'TODO') || [];
  }
  get tachesInProgress(): TaskModel[] {
    return this.projet?.taches?.filter(t => t.etat === 'IN_PROGRESS') || [];
  }
  get tachesDone(): TaskModel[] {
    return this.projet?.taches?.filter(t => t.etat === 'DONE') || [];
  }
  
}