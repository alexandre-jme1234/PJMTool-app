# 🚀 Guide d'Implémentation Rapide

## ✅ Déjà Fait

1. ✅ Service de notifications créé
2. ✅ Composant notification créé
3. ✅ Pipe date français créé
4. ✅ Priorité "BASSE" → "FAIBLE" dans dashboard

---

## 🔥 À Faire MAINTENANT (Ordre de Priorité)

### 1. Intégrer le composant notification dans l'app

**Fichier** : `src/app/app.component.html`

Ajouter en haut du fichier :
```html
<app-notification></app-notification>
<!-- Le reste de votre contenu -->
```

**Fichier** : `src/app/app.component.ts`

Ajouter l'import :
```typescript
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  ...
  imports: [RouterOutlet, NotificationComponent], // Ajouter NotificationComponent
  ...
})
```

---

### 2. Ajouter le créateur comme ADMINISTRATEUR à la création de projet

**Fichier** : `src/app/pages/dashboard/dashboard.component.ts`

Modifier la méthode `createProject()` (ligne 197) :

```typescript
createProject(): void {
  if (this.newProject.nom && this.newProject.date_echeance) {
    this.showProjectAlert = false;
    
    if(this.userLogged.nom !== undefined) {
      this.newProject.createur = this.userLogged.nom;
    }

    this.projetService.onCreateProject(this.newProject).subscribe({
      next: (response: any) => {
        const nouveauProjetId = response.data?.id || response.id;
        
        // ✨ NOUVEAU : Ajouter le créateur comme ADMINISTRATEUR
        if (nouveauProjetId && this.userLogged.nom) {
          this.userService.addUserRoledToProject(
            this.userLogged.nom,
            'ADMINISTRATEUR',
            nouveauProjetId
          ).subscribe({
            next: () => {
              console.log('✓ Créateur ajouté comme ADMINISTRATEUR');
              this.notificationService.success('Projet créé avec succès !');
            },
            error: (err) => {
              console.error('Erreur ajout ADMIN:', err);
              this.notificationService.warning('Projet créé mais erreur d\'ajout du rôle');
            }
          });
        }
        
        this.loadProjects();
        this.resetNewProject();
        this.showModal = false;
      },
      error: (error) => {
        console.error('[Erreur] Projet non créé:', error);
        this.notificationService.error('Erreur lors de la création du projet');
      },
    });
  } else {
    this.showProjectAlert = true;
  }
}
```

**Ajouter dans le constructor** :
```typescript
constructor(
  private projetService: ProjectService,
  private router: Router,
  private taskService: TaskService,
  private http: HttpClient,
  private userService: UserService,
  private notificationService: NotificationService // ✨ AJOUTER
) {}
```

**Ajouter l'import** :
```typescript
import { NotificationService } from '../../services/notification/notification.service';
```

---

### 3. Ajouter bouton retour Dashboard dans projet

**Fichier** : `src/app/components/project/project.component.html`

Modifier la div de l'en-tête (ligne 3) :

```html
<div class="flex items-center gap-4 mb-6">
  <!-- ✨ NOUVEAU : Bouton retour -->
  <button 
    (click)="goMainPage()" 
    class="text-2xl text-gray-600 hover:text-blue-600 transition"
    title="Retour au Dashboard">
    ←
  </button>
  
  <img
    src="assets/images/logo_accueil.png"
    alt="logo"
    (click)="goMainPage()"
    class="w-auto h-10 rounded cursor-pointer hover:shadow-lg transition"
  />
  <h1 class="text-3xl font-bold text-blue-900">{{ projet?.nom }}</h1>
</div>
```

---

### 4. Améliorer le layout du Dashboard (centrer nom user)

**Fichier** : `src/app/pages/dashboard/dashboard.component.html`

Remplacer les lignes 2-14 par :

```html
<div class="flex items-center justify-between w-full my-8 py-4">
  <!-- Gauche : Logo + Titre -->
  <div class="flex items-center gap-4">
    <img src="assets/images/logo_accueil.png" alt="logo" class="w-auto h-12 rounded shadow" />
    <h2 class="text-4xl font-bold tracking-wide">Dashboard</h2>
  </div>

  <!-- Centre : Nom utilisateur + Rôle projet -->
  <div *ngIf="userLogged" class="flex flex-col items-center">
    <h3 class="font-bold text-lg">{{ userLogged.nom }}</h3>
    <p *ngIf="currentProjectRole" class="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
      {{ currentProjectRole }}
    </p>
    <p *ngIf="!currentProjectRole" class="text-xs text-gray-400">
      Sélectionnez un projet
    </p>
  </div>

  <!-- Droite : Bouton déconnexion -->
  <button 
    type="button" 
    (click)="setLoggUser()" 
    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
    Se déconnecter 👋
  </button>
</div>
```

**Ajouter dans dashboard.component.ts** :

```typescript
// Après la ligne 100
currentProjectRole: string | null = null;

// Modifier onSelectProject (ligne 186)
onSelectProject(projet: Project) {
  this.selectedProject = projet;
  if (projet.id !== undefined) {
    this.loadTasksForProject(projet.id);
    this.loadCurrentUserRoleForProject(projet.id); // ✨ AJOUTER
  }
}

// Ajouter cette nouvelle méthode
loadCurrentUserRoleForProject(projectId: number): void {
  if (!this.userLogged?.id) return;
  
  this.projetService.getUsersRoledByProjectId(projectId).subscribe({
    next: (response) => {
      const userRoleData = response.data;
      const userRole = userRoleData.find((urp: any) => urp.utilisateur === this.userLogged.id);
      
      if (userRole) {
        const roleMapping: { [key: number]: string } = {
          1: "ADMINISTRATEUR",
          2: "MEMBRE",
          3: "OBSERVATEUR"
        };
        this.currentProjectRole = roleMapping[userRole.role] || 'OBSERVATEUR';
      } else {
        this.currentProjectRole = null;
      }
    },
    error: (error) => {
      console.error('Erreur chargement rôle:', error);
      this.currentProjectRole = null;
    }
  });
}
```

---

### 5. Masquer bouton "Ajouter tâche" pour OBSERVATEUR

**Fichier** : `src/app/pages/dashboard/dashboard.component.html`

Modifier le bouton (ligne 72) :

```html
<button 
  *ngIf="currentProjectRole !== 'OBSERVATEUR'"
  (click)="onAddTaskClick()"
  [disabled]="!selectedProject"
  class="ml-2 flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-2xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
  title="Ajouter une tâche" 
  aria-label="Ajouter une tâche">
  +
</button>

<!-- ✨ NOUVEAU : Message pour OBSERVATEUR -->
<span 
  *ngIf="currentProjectRole === 'OBSERVATEUR' && selectedProject"
  class="text-sm text-gray-500 italic">
  🔒 Lecture seule
</span>
```

---

### 6. Corriger la suppression de projets avec confirmation

**Fichier** : `src/app/pages/dashboard/dashboard.component.ts`

Remplacer la méthode `deleteSelectedProjects()` (ligne 446) :

```typescript
deleteSelectedProjects() {
  if (this.selectedProjectIds.length === 0) return;
  
  const count = this.selectedProjectIds.length;
  const message = count === 1 
    ? 'Voulez-vous vraiment supprimer ce projet ?\n\n⚠️ Cette action est irréversible.' 
    : `Voulez-vous vraiment supprimer ces ${count} projets ?\n\n⚠️ Cette action est irréversible.`;
  
  if (!confirm(message)) {
    console.log('Suppression annulée par l\'utilisateur');
    return;
  }
  
  const deleteRequests = this.selectedProjectIds.map(id =>
    this.http.delete('/api/projet/delete/' + id)
  );

  forkJoin(deleteRequests).subscribe({
    next: () => {
      this.notificationService.success(`${count} projet(s) supprimé(s) avec succès`);
      this.loadProjects();
      this.selectedProjectIds = [];
      this.selectedProject = null; // Réinitialiser la sélection
    },
    error: (err) => {
      this.notificationService.error('Erreur lors de la suppression des projets');
      console.error('Erreur suppression:', err);
    }
  });
}
```

---

### 7. Utiliser le pipe date français dans task-overlay

**Fichier** : `src/app/components/task-overlay/task-overlay.component.ts`

Ajouter l'import :
```typescript
import { FrenchDatePipe } from '../../shared/french-date.pipe';

@Component({
  ...
  imports: [CommonModule, FormsModule, FrenchDatePipe], // Ajouter FrenchDatePipe
  ...
})
```

**Fichier** : `src/app/components/task-overlay/task-overlay.component.html`

Modifier les dates (lignes 82-87) :

```html
<div class="bg-gray-50 p-4 rounded-lg">
  <p class="text-sm text-gray-500">📅 Date de début</p>
  <p class="text-gray-700 font-medium">{{ task?.date_debut | frenchDate }}</p>
</div>
<div class="bg-gray-50 p-4 rounded-lg">
  <p class="text-sm text-gray-500">📅 Date de fin</p>
  <p class="text-gray-700 font-medium">{{ task?.date_fin | frenchDate }}</p>
</div>
```

---

## 🧪 Tests à Effectuer

Après ces modifications :

1. ✅ Créer un nouveau projet → Vérifier que vous êtes ADMINISTRATEUR
2. ✅ Cliquer sur le bouton ← dans un projet → Retour au Dashboard
3. ✅ Sélectionner un projet → Voir votre rôle affiché en haut
4. ✅ En tant qu'OBSERVATEUR → Le bouton + tâche doit être masqué
5. ✅ Cocher des projets et cliquer "Supprimer" → Pop-up de confirmation
6. ✅ Ouvrir une tâche → Dates en français

---

## 📝 Modifications Restantes (Optionnelles)

Ces modifications nécessitent plus de travail et peuvent être faites dans un second temps :

- **Historique des tâches** : Nécessite création de table backend + endpoint
- **Liste users dans édition tâche** : Nécessite refonte du formulaire
- **Messages d'erreur login/signup** : Nécessite analyse des codes d'erreur backend
- **Commanditaire par défaut** : Nécessite modification du formulaire de création

---

## 🚨 Commandes à Exécuter

```bash
# Dans le dossier PJM-frontend-app
npm install
ng serve

# Vérifier qu'il n'y a pas d'erreurs de compilation
```

---

## 💡 Conseil

Faites ces modifications **une par une** et testez après chaque modification pour identifier rapidement les problèmes.

Commencez par :
1. Intégrer le composant notification
2. Ajouter le bouton retour
3. Corriger la suppression de projets

Puis continuez avec les autres.
