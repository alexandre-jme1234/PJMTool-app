# 📋 Corrections Demandées - Liste Complète

## ✅ Déjà Créé

### 1. Service de Notifications
**Fichier** : `notification.service.ts`
- ✅ Créé avec méthodes `success()`, `error()`, `warning()`, `info()`
- Pop-ups en haut à droite avec auto-dismiss

### 2. Composant Notification
**Fichier** : `notification.component.ts`
- ✅ Affichage des toasts avec animations
- Codes couleur par type

### 3. Pipe Format Date Français
**Fichier** : `french-date.pipe.ts`
- ✅ Format "jeudi 10 octobre 2024"

---

## 🔧 À Implémenter

### PRIORITÉ 1 : Sécurité & Permissions

#### A. Créateur de projet = ADMINISTRATEUR automatique
**Fichiers** : `dashboard.component.ts`, `project.service.ts`
```typescript
// Dans createProject()
// 1. Créer le projet
// 2. Appeler backend pour ajouter créateur comme ADMINISTRATEUR
this.userService.addUserRoledToProject(
  this.userLogged.nom,
  'ADMINISTRATEUR',
  nouveauProjetId
)
```

#### B. Messages d'erreur login/signup
**Fichier** : `user.service.ts`
```typescript
// Ajouter dans addUser() :
.catch(error => {
  if (error.status === 409) {
    notificationService.error('Cet utilisateur existe déjà');
  } else if (error.message.includes('special')) {
    notificationService.error('Caractères spéciaux non autorisés');
  } else {
    notificationService.error('Erreur lors de l\'inscription');
  }
})

// Ajouter dans login() :
.catch(error => {
  if (error.status === 401) {
    notificationService.error('Email ou mot de passe incorrect');
  } else if (error.status === 404) {
    notificationService.warning('Utilisateur non trouvé. Veuillez vous inscrire.');
  }
})
```

---

### PRIORITÉ 2 : UX Tâches

#### C. Améliorer UI édition tâche
**Fichier** : `task-overlay.component.html`

**Layout souhaité** :
```html
<!-- Ligne 1 : Nom + Priorité -->
<div class="grid grid-cols-2 gap-4">
  <div>
    <label>Nom de la tâche</label>
    <input [(ngModel)]="editTask.nom" />
  </div>
  <div>
    <label>Priorité</label>
    <select [(ngModel)]="editTask.priorite">
      <option value=1>HAUTE</option>
      <option value=2>MOYENNE</option>
      <option value=3>FAIBLE</option>
    </select>
  </div>
</div>

<!-- Ligne 2 : Commanditaire + Destinataire -->
<div class="grid grid-cols-2 gap-4">
  <div>
    <label>👤 Commanditaire</label>
    <select [(ngModel)]="editTask.commanditaire">
      <option *ngFor="let user of utilisateursProjet" [ngValue]="user">
        {{ user.nom }} ({{ user.role_app }})
      </option>
    </select>
  </div>
  <div>
    <label>🎯 Destinataire</label>
    <select [(ngModel)]="editTask.destinataire">
      <option *ngFor="let user of utilisateursProjet" [ngValue]="user">
        {{ user.nom }} ({{ user.role_app }})
      </option>
    </select>
  </div>
</div>

<!-- Ligne 3 : Dates -->
<div class="grid grid-cols-2 gap-4">
  <div>
    <label>📅 Date de début</label>
    <input type="date" [(ngModel)]="editTask.date_debut" />
  </div>
  <div>
    <label>📅 Date de fin</label>
    <input type="date" [(ngModel)]="editTask.date_fin" />
  </div>
</div>

<!-- Description -->
<div>
  <label>Description</label>
  <textarea [(ngModel)]="editTask.description"></textarea>
</div>
```

**Modifications nécessaires** :
- Ajouter `@Input() utilisateursProjet: UserModel[]` dans `task-overlay.component.ts`
- Passer les utilisateurs depuis `project.component.html` :
```html
<app-task-overlay
  [task]="selectedTask"
  [utilisateursProjet]="utilisateursProjet"
  ...>
</app-task-overlay>
```

#### D. Priorité par défaut = FAIBLE
**Fichier** : `task.service.ts` ou dans les composants
```typescript
// Dans createTask() et updateTask()
if (!task.priorite || task.priorite === null) {
  task.priorite = { id: 3, nom: 'FAIBLE' };
}
```

#### E. Commanditaire par défaut = user loggé
**Fichier** : `dashboard.component.ts`, `task-overlay.component.ts`
```typescript
// Dans resetTaskForm() et enableEdit()
const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
this.newTask.commanditaire = loggedUser;
```

#### F. Afficher dates au format français
**Fichier** : `task-overlay.component.html`
```html
<p>{{ task?.date_debut | frenchDate }}</p>
<p>{{ task?.date_fin | frenchDate }}</p>
```

---

### PRIORITÉ 3 : Dashboard

#### G. Centrer nom user + rôle dynamique
**Fichier** : `dashboard.component.html`
```html
<div class="flex items-center justify-between w-full">
  <div class="flex items-center gap-4">
    <img src="assets/images/logo_accueil.png" />
    <h2>Dashboard</h2>
  </div>
  
  <div class="flex items-center gap-4">
    <div class="text-center">
      <p class="font-bold">{{ userLogged.nom }}</p>
      <p class="text-sm text-gray-600">
        {{ currentProjectRole || 'Aucun projet sélectionné' }}
      </p>
    </div>
    <button (click)="setLoggUser()">Se déconnecter 👋</button>
  </div>
</div>
```

**Logique** :
```typescript
// Dans dashboard.component.ts
currentProjectRole: string | null = null;

onSelectProject(projet: Project) {
  this.selectedProject = projet;
  this.loadCurrentUserRoleForProject(projet.id);
}

loadCurrentUserRoleForProject(projectId: number) {
  // Appeler le backend pour récupérer le rôle
  this.projetService.getUsersRoledByProjectId(projectId).subscribe(response => {
    const userRole = response.data.find(urp => urp.utilisateur === this.userLogged.id);
    const roleMapping = { 1: "ADMINISTRATEUR", 2: "MEMBRE", 3: "OBSERVATEUR" };
    this.currentProjectRole = roleMapping[userRole?.role] || 'OBSERVATEUR';
  });
}
```

#### H. Afficher priorité + état dans liste Dashboard
**Fichier** : `task.component.html` (mode="card")
```html
<div class="flex items-center gap-2">
  <span class="badge" [ngClass]="getPriorityClass()">
    {{ task.priorite?.nom }}
  </span>
  <span class="badge" [ngClass]="getEtatClass()">
    {{ getEtatLabel() }}
  </span>
</div>
```

#### I. Masquer bouton addTache pour OBSERVATEUR
**Fichier** : `dashboard.component.html`
```html
<button *ngIf="currentProjectRole !== 'OBSERVATEUR'"
        (click)="onAddTaskClick()"
        ...>
  +
</button>
```

---

### PRIORITÉ 4 : Navigation

#### J. Bouton retour Dashboard depuis projet
**Fichier** : `project.component.html`
```html
<div class="flex items-center gap-4 mb-6">
  <button (click)="goMainPage()" 
          class="text-gray-600 hover:text-gray-800"
          title="Retour au Dashboard">
    ← 
  </button>
  <img src="assets/images/logo_accueil.png" ... />
  <h1>{{ projet?.nom }}</h1>
</div>
```

---

### PRIORITÉ 5 : Suppression Projets

#### K. Confirmation suppression projets
**Fichier** : `dashboard.component.ts`
```typescript
deleteSelectedProjects() {
  if (this.selectedProjectIds.length === 0) return;
  
  const count = this.selectedProjectIds.length;
  const message = count === 1 
    ? 'Voulez-vous vraiment supprimer ce projet ?' 
    : `Voulez-vous vraiment supprimer ces ${count} projets ?`;
  
  if (!confirm(message)) return;
  
  const deleteRequests = this.selectedProjectIds.map(id =>
    this.http.delete('/api/projet/delete/' + id)
  );

  forkJoin(deleteRequests).subscribe({
    next: () => {
      this.notificationService.success(`${count} projet(s) supprimé(s)`);
      this.loadProjects();
      this.selectedProjectIds = [];
    },
    error: (err) => {
      this.notificationService.error('Erreur lors de la suppression');
      console.error(err);
    }
  });
}
```

---

### PRIORITÉ 6 : Historique Tâches

#### L. Ajouter historique dans détails tâche
**Nouveau modèle** : `task-history.model.ts`
```typescript
export interface TaskHistoryEvent {
  id: number;
  type: 'creation' | 'modification' | 'cloture';
  date: Date;
  user: UserModel;
  userRole: string;
  details?: string;
}
```

**Fichier** : `task-overlay.component.html`
```html
<div class="space-y-2">
  <h3 class="font-semibold">📜 Historique</h3>
  <div class="bg-gray-50 p-4 rounded-lg">
    <div *ngFor="let event of taskHistory" class="border-l-2 border-blue-300 pl-3 py-2">
      <p class="font-medium">
        {{ event.type === 'creation' ? '✨ Création' : event.type === 'modification' ? '✏️ Modification' : '✅ Clôture' }}
      </p>
      <p class="text-sm text-gray-600">
        Par {{ event.user.nom }} ({{ event.userRole }})
      </p>
      <p class="text-xs text-gray-500">
        {{ event.date | frenchDate }}
      </p>
    </div>
  </div>
</div>
```

**Backend requis** :
- Table `task_history` avec colonnes : `id`, `task_id`, `event_type`, `user_id`, `user_role`, `date`, `details`
- Endpoint : `GET /api/tache/{id}/history`

---

## 🎯 Ordre d'Implémentation Recommandé

1. **Notifications** (déjà fait ✅)
2. **Format dates** (déjà fait ✅)
3. **Créateur = ADMIN** (critique)
4. **Messages erreur login/signup** (UX)
5. **UI édition tâche** (UX)
6. **Dashboard layout** (UX)
7. **Bouton retour** (navigation)
8. **Suppression projets** (bug fix)
9. **Historique** (feature avancée)

---

## 📝 Notes d'Implémentation

### Intégrer le composant notification dans app.component.html
```html
<app-notification></app-notification>
<router-outlet></router-outlet>
```

### Vérifier les priorités dans tous les composants
- ✅ `project.component.ts` : `prioriteFaible`
- ⚠️ `dashboard.component.ts` ligne 68 : encore "BASSE" → changer en "FAIBLE"
- ⚠️ Vérifier `task.service.ts`

### Backend - Endpoints requis
- `POST /api/projet/{id}/add-admin` : Ajouter créateur comme ADMIN
- `GET /api/tache/{id}/history` : Récupérer historique
- `POST /api/tache/{id}/history` : Ajouter événement historique
