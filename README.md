# PJMTool - Outil de Gestion de Projets

Application full-stack de gestion de projets et de tâches développée avec **Spring Boot** (backend) et **Angular 18** (frontend).

---

## 📋 Table des Matières

1. [Architecture Technique](#architecture-technique)
2. [Prérequis](#prérequis)
3. [Installation et Configuration](#installation-et-configuration)
4. [Déploiement](#déploiement)
5. [Structure du Code](#structure-du-code)
6. [Tests](#tests)
7. [API Documentation](#api-documentation)

---

## 🏗️ Architecture Technique

### Stack Technologique

**Backend (Spring Boot 3.4.4)**
- **Framework**: Spring Boot avec Spring Web MVC
- **ORM**: Spring Data JPA + Hibernate
- **Base de données**: 
  - MariaDB (production)
  - H2 (tests)
- **Build**: Maven 3.x
- **Java**: Version 17 (LTS)
- **Tests**: JUnit 5, Mockito, MockMvc, JaCoCo (couverture)

**Frontend (Angular 18)**
- **Framework**: Angular 18.2.19
- **UI Components**: Angular Material
- **Tests**: Jasmine, Karma
- **Build**: Angular CLI
- **Node**: Version 20+

**Infrastructure**
- **Conteneurisation**: Docker + Docker Compose
- **Base de données**: MariaDB 11.x
- **Reverse Proxy**: (À configurer selon environnement)

### Architecture en Couches (Backend)

```
backend/
├── controllers/     # Couche présentation (REST API)
├── services/        # Couche métier (logique applicative)
├── dao/            # Couche accès données (repositories)
├── models/         # Entités JPA
├── dto/            # Objets de transfert de données
└── responses/      # Wrappers de réponses API
```

**Pattern utilisé**: Architecture en couches avec séparation des responsabilités
- **Controllers**: Gèrent les requêtes HTTP et délèguent aux services
- **Services**: Contiennent la logique métier
- **Repositories**: Abstraction d'accès aux données (Spring Data JPA)

---

## 🔧 Prérequis

### Développement Local

- **Java JDK 17** ou supérieur
- **Maven 3.8+** (ou utiliser `./mvnw` fourni)
- **Node.js 20+** et npm
- **MariaDB 11+** (ou Docker)
- **Git**

### Déploiement Docker

- **Docker Engine 20.10+**
- **Docker Compose 2.0+**

---

## 📦 Installation et Configuration

### 1. Cloner le Projet

```bash
git clone https://github.com/alexandre-jme1234/PJMTool-app.git
cd PJMTool-app
```

### 2. Configuration Backend

#### Base de Données

**Fichier**: `backend/src/main/resources/application.properties`

```properties
# Configuration MariaDB
spring.datasource.url=jdbc:mariadb://localhost:3306/PJMTool-db
spring.datasource.username=root
spring.datasource.password=$$$$
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

**Points clés**:
- `ddl-auto=update`: Hibernate met à jour automatiquement le schéma (⚠️ utiliser `validate` en production)
- `show-sql=true`: Affiche les requêtes SQL (désactiver en production)

#### Profils Spring

**Fichier**: `backend/src/main/resources/application-test.properties`

```properties
# Configuration H2 pour les tests
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
```

**Activation du profil**: `@ActiveProfiles("test")` dans les classes de test

### 3. Configuration Frontend

**Fichier**: `PJM-frontend-app/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**Fichier**: `PJM-frontend-app/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-domaine.com/api'
};
```

---

## 🚀 Déploiement

### Option 1: Déploiement Local (Développement)

#### Backend

```bash
cd backend

# Compilation et tests
./mvnw clean install

# Lancement du serveur (port 8080)
./mvnw spring-boot:run

# Ou avec un profil spécifique
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Points techniques**:
- Le serveur démarre sur `http://localhost:8080`
- L'API est accessible via `/api/*`
- Spring DevTools active le rechargement automatique

#### Frontend

```bash
cd PJM-frontend-app

# Installation des dépendances
npm install

# Serveur de développement (port 4200)
npm start
# ou
ng serve

# Build de production
npm run build
# Artefacts dans dist/
```

**Points techniques**:
- Hot reload activé par défaut
- Proxy configuré pour éviter CORS (si nécessaire)
- Build optimisé avec AOT compilation

### Option 2: Déploiement Docker (Recommandé)

#### Architecture Docker

```yaml
services:
  mariadb:      # Base de données
  backend:      # API Spring Boot
  frontend:     # Application Angular
```

#### Commandes de Déploiement

```bash
# Construction et démarrage de tous les services
docker-compose up --build

# Démarrage en arrière-plan
docker-compose up -d

# Arrêt des services
docker-compose down

# Arrêt avec suppression des volumes (⚠️ perte de données)
docker-compose down -v
```

#### Détails Techniques des Conteneurs

**Backend Dockerfile** (`backend/Dockerfile`):

```dockerfile
FROM eclipse-temurin:17-jdk-focal

WORKDIR /app

# Copie du wrapper Maven
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Pré-téléchargement des dépendances (optimisation du cache Docker)
RUN ./mvnw dependency:go-offline

# Copie du code source
COPY src ./src

EXPOSE 8080

# Lancement avec Maven (dev) ou JAR (prod)
CMD ["./mvnw", "spring-boot:run"]
```

**Points d'optimisation**:
- **Multi-stage build** (à implémenter): Séparer build et runtime
- **Layers caching**: Les dépendances sont téléchargées avant le code source
- **JVM tuning**: Ajouter `-Xmx512m -Xms256m` pour limiter la mémoire

**Frontend Dockerfile** (`PJM-frontend-app/Dockerfile`):

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copie du code
COPY . .

EXPOSE 4200

CMD ["npm", "start"]
```

**Optimisation recommandée** (Build de production):

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serveur Nginx
FROM nginx:alpine
COPY --from=builder /app/dist/pjm-frontend-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

#### Variables d'Environnement Docker

**Backend** (`docker-compose.yml`):

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:mariadb://mariadb:3306/PJMTool-db
  SPRING_DATASOURCE_USERNAME: root
  SPRING_DATASOURCE_PASSWORD: $$$$
  SPRING_PROFILES_ACTIVE: prod
```

**Points clés**:
- Les variables d'environnement **surchargent** `application.properties`
- Utiliser des **secrets Docker** pour les mots de passe en production
- Le nom d'hôte `mariadb` correspond au nom du service Docker

### Option 3: Déploiement Production (JAR)

#### Build du Backend

```bash
cd backend

# Build avec tests
./mvnw clean package

# Build sans tests (plus rapide)
./mvnw clean package -DskipTests

# Le JAR est généré dans target/backend-0.0.1-SNAPSHOT.jar
```

#### Exécution du JAR

```bash
# Lancement basique
java -jar target/backend-0.0.1-SNAPSHOT.jar

# Avec profil et options JVM
java -Xmx1024m -Xms512m \
     -Dspring.profiles.active=prod \
     -jar target/backend-0.0.1-SNAPSHOT.jar
```

#### Build du Frontend

```bash
cd PJM-frontend-app

# Build de production
ng build --configuration production

# Artefacts optimisés dans dist/pjm-frontend-app/
```

**Servir les fichiers statiques**:
- **Nginx**: Copier `dist/` vers `/var/www/html`
- **Apache**: Configurer un VirtualHost
- **Spring Boot**: Servir depuis `src/main/resources/static`

---

## 📂 Structure du Code

### Backend (Spring Boot)

```
backend/src/main/java/com/visiplus/backend/
│
├── controllers/              # Endpoints REST
│   ├── ProjetController.java       # CRUD projets
│   ├── TacheController.java        # CRUD tâches
│   └── UtilisateurController.java  # Auth & gestion users
│
├── services/                 # Logique métier
│   ├── impl/                       # Implémentations
│   ├── ProjetService.java
│   ├── TacheService.java
│   └── UtilisateurService.java
│
├── dao/                      # Repositories JPA
│   ├── ProjetRepository.java
│   ├── TacheRepository.java
│   └── UtilisateurRepository.java
│
├── models/                   # Entités JPA
│   ├── Projet.java                 # @Entity
│   ├── Tache.java
│   ├── Utilisateur.java
│   ├── Role.java
│   └── UserRoleProjet.java         # Table de jointure
│
├── dto/                      # Data Transfer Objects
│   ├── ProjetRequest.java
│   ├── TacheRequest.java
│   └── LoginRequest.java
│
├── responses/                # Wrappers de réponses
│   └── ApiResponse.java            # Format unifié
│
└── initializer/              # Données initiales
    └── DataInitializer.java        # @PostConstruct
```

#### Exemple de Code Clé

**Controller Pattern** (`ProjetController.java`):

```java
@RestController
@RequestMapping("/api/projet")
public class ProjetController {
    
    @Autowired
    private ProjetService projetService;
    
    @PostMapping("/create")
    public ResponseEntity<?> createProject(@RequestBody ProjetRequest request) {
        // Validation
        if (utilisateur.getEtat_connexion() == false) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Utilisateur non connecté", null));
        }
        
        // Logique métier déléguée au service
        Projet projet = projetService.create(nouveauProjet);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Projet créé", projet));
    }
}
```

**Service Pattern** (`ProjetServiceImpl.java`):

```java
@Service
public class ProjetServiceImpl implements ProjetService {
    
    @Autowired
    private ProjetRepository projetRepository;
    
    @Override
    public int create(Projet projet) {
        Projet saved = projetRepository.save(projet);
        return saved.getId();
    }
}
```

**Repository Pattern** (`ProjetRepository.java`):

```java
@Repository
public interface ProjetRepository extends CrudRepository<Projet, Integer> {
    Projet findByNom(String nom);
    List<Projet> findAll();
}
```

### Frontend (Angular)

```
PJM-frontend-app/src/app/
│
├── components/               # Composants UI
│   ├── project/
│   │   ├── project.component.ts
│   │   ├── project.component.html
│   │   └── project.component.spec.ts
│   └── ...
│
├── services/                 # Services Angular
│   ├── projects/
│   │   ├── project.service.ts
│   │   └── project.service.spec.ts
│   └── auth/
│
├── models/                   # Interfaces TypeScript
│   ├── projet.model.ts
│   └── utilisateur.model.ts
│
└── pages/                    # Pages/Routes
    ├── signin-up/
    └── dashboard/
```

#### Exemple de Code Clé

**Service HTTP** (`project.service.ts`):

```typescript
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = environment.apiUrl + '/projet';

  constructor(private http: HttpClient) {}

  createProject(projet: ProjetRequest): Observable<ApiResponse<Projet>> {
    return this.http.post<ApiResponse<Projet>>(
      `${this.apiUrl}/create`, 
      projet
    );
  }
}
```

**Component** (`project.component.ts`):

```typescript
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html'
})
export class ProjectComponent implements OnInit {
  projets: Projet[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (response) => this.projets = response.data,
      error: (err) => console.error('Erreur', err)
    });
  }
}
```

---

## 🧪 Tests

### Backend - Tests Unitaires

**Framework**: JUnit 5 + Mockito + MockMvc

#### Exécution des Tests

```bash
cd backend

# Tous les tests
./mvnw test

# Tests spécifiques
./mvnw test -Dtest=ProjetControllerTest

# Avec rapport de couverture JaCoCo
./mvnw clean test jacoco:report
# Rapport dans target/site/jacoco/index.html
```

#### Structure des Tests

```
backend/src/test/java/com/visiplus/backend/
├── controllers/
│   ├── ProjetControllerTest.java      # @WebMvcTest
│   ├── TacheControllerTest.java
│   └── UtilisateurControllerTest.java
├── services/
└── BackendApplicationTests.java       # @SpringBootTest
```

#### Exemple de Test Controller

```java
@WebMvcTest(ProjetController.class)
class ProjetControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private ProjetService projetService;
    
    @Test
    void testCreateProject_Success() throws Exception {
        // ARRANGE
        when(projetService.create(any())).thenReturn(1);
        
        // ACT & ASSERT
        mockMvc.perform(post("/api/projet/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nom\":\"Test\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
```

**Points clés**:
- `@WebMvcTest`: Charge uniquement la couche web (rapide)
- `@MockBean`: Simule les dépendances
- `MockMvc`: Teste les endpoints sans serveur HTTP

### Frontend - Tests Unitaires

**Framework**: Jasmine + Karma

#### Exécution des Tests

```bash
cd PJM-frontend-app

# Tests en mode watch
ng test

# Tests en mode CI (single run)
ng test --watch=false --browsers=ChromeHeadless

# Avec couverture
ng test --code-coverage
# Rapport dans coverage/
```

#### Exemple de Test Service

```typescript
describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create project', () => {
    const mockProjet = { nom: 'Test' };
    
    service.createProject(mockProjet).subscribe(response => {
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/create`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockProjet });
  });
});
```

---

## 📡 API Documentation

### Endpoints Principaux

#### Projets

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| `GET` | `/api/projet/all` | Liste tous les projets | - |
| `GET` | `/api/projet/id/{id}` | Récupère un projet | - |
| `POST` | `/api/projet/create` | Crée un projet | `ProjetRequest` |
| `DELETE` | `/api/projet/delete/{id}` | Supprime un projet | - |

#### Tâches

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| `POST` | `/api/tache/create` | Crée une tâche | `TacheRequest` |
| `PATCH` | `/api/tache/update` | Met à jour une tâche | `TacheRequest` |
| `GET` | `/api/tache/project/{id}` | Tâches d'un projet | - |
| `DELETE` | `/api/tache/delete/{id}` | Supprime une tâche | - |

#### Utilisateurs

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| `POST` | `/api/utilisateur/create` | Crée un utilisateur | `Utilisateur` |
| `PATCH` | `/api/utilisateur/login` | Connexion | `LoginRequest` |
| `PATCH` | `/api/utilisateur/logout` | Déconnexion | `{email}` |
| `POST` | `/api/utilisateur/add-user-to-project` | Ajoute user au projet | `Utilisateur` |

### Format de Réponse Standard

```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

### Exemples de Requêtes

**Créer un projet**:

```bash
curl -X POST http://localhost:8080/api/projet/create \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Mon Projet",
    "description": "Description",
    "createur": "John Doe",
    "date_echeance": "2025-12-31"
  }'
```

**Créer une tâche**:

```bash
curl -X POST http://localhost:8080/api/tache/create \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Tâche 1",
    "description": "Description",
    "projet_id": 1,
    "commanditaire_id": 1,
    "destinataire_id": 2,
    "etat": "TODO",
    "priorite_id": 1
  }'
```

---

## 🔐 Sécurité (À Implémenter)

### Recommandations

1. **Authentification JWT**: Remplacer le système actuel par JWT
2. **HTTPS**: Activer SSL/TLS en production
3. **CORS**: Configurer les origines autorisées
4. **Validation**: Ajouter `@Valid` sur les DTOs
5. **SQL Injection**: Utiliser les requêtes paramétrées (déjà fait avec JPA)

### Configuration CORS (Backend)

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH");
    }
}
```

---

## 📊 Monitoring et Logs

### Logs Backend

**Configuration** (`application.properties`):

```properties
# Niveau de log
logging.level.root=INFO
logging.level.com.visiplus.backend=DEBUG

# Fichier de log
logging.file.name=logs/application.log
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

### Actuator (Spring Boot)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**Endpoints**: `/actuator/health`, `/actuator/metrics`

---

## 🐛 Dépannage

### Problèmes Courants

**Backend ne démarre pas**:
- Vérifier que MariaDB est lancé
- Vérifier les credentials dans `application.properties`
- Vérifier le port 8080 (déjà utilisé ?)

**Frontend ne se connecte pas au backend**:
- Vérifier l'URL dans `environment.ts`
- Vérifier CORS
- Vérifier que le backend est accessible

**Tests échouent**:
- Vérifier le profil `test` est actif
- Vérifier H2 est dans les dépendances
- Nettoyer: `./mvnw clean`

---

## 📝 Licence

ISC License

---

## 👥 Contributeurs

- Alexandre JME (@alexandre-jme1234)

---

## 📚 Ressources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/)
- [Angular Documentation](https://angular.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [MariaDB Documentation](https://mariadb.com/kb/en/)
