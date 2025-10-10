# 📊 Rapports de Couverture de Code

Ce document explique comment générer et consulter les rapports de couverture de code pour le frontend et le backend.

## 🎯 Objectifs de Couverture

| Composant | Lignes | Branches | Fonctions |
|-----------|--------|----------|-----------|
| Frontend  | ≥ 50%  | ≥ 50%    | ≥ 50%     |
| Backend   | ≥ 50%  | ≥ 50%    | N/A       |

## 🚀 Génération Locale

### Frontend (Angular + Karma)

```bash
cd PJM-frontend-app

# Exécuter les tests avec couverture
npm run test:ci

# Ouvrir le rapport HTML
start coverage/pjm-frontend-app/index.html  # Windows
open coverage/pjm-frontend-app/index.html   # macOS
xdg-open coverage/pjm-frontend-app/index.html  # Linux
```

**Formats générés** :
- `coverage/pjm-frontend-app/index.html` - Rapport HTML interactif
- `coverage/pjm-frontend-app/lcov.info` - Format LCOV (pour CI/CD)
- `coverage/pjm-frontend-app/coverage.json` - Format JSON

### Backend (Java + JaCoCo)

```bash
cd backend

# Exécuter les tests avec couverture
mvn clean verify

# Ouvrir le rapport HTML
start target/site/jacoco/index.html  # Windows
open target/site/jacoco/index.html   # macOS
xdg-open target/site/jacoco/index.html  # Linux
```

**Formats générés** :
- `target/site/jacoco/index.html` - Rapport HTML interactif
- `target/site/jacoco/jacoco.xml` - Format XML (pour CI/CD)
- `target/site/jacoco/jacoco.csv` - Format CSV

## 🔄 CI/CD Automatique

Les rapports de couverture sont générés automatiquement via GitHub Actions :

### Déclencheurs
- ✅ Push sur `main`, `master`, `develop`
- ✅ Pull Requests vers `main` ou `master`
- ✅ Déclenchement manuel

### Workflow
1. **Frontend Coverage** : Tests Karma + génération rapport
2. **Backend Coverage** : Tests JUnit + JaCoCo
3. **Upload vers Codecov** : Centralisation des métriques
4. **Artifacts** : Rapports téléchargeables (30 jours)
5. **PR Comments** : Commentaires automatiques sur les PR

### Consulter les Rapports

#### Via GitHub Actions
1. Allez sur [Actions](../../actions)
2. Sélectionnez le workflow "Code Coverage Reports"
3. Cliquez sur un run
4. Téléchargez les artifacts :
   - `frontend-coverage-report`
   - `backend-coverage-report`

#### Via Codecov (optionnel)
Si configuré, consultez : `https://codecov.io/gh/alexandre-jme1234/PJMTool-app`

## 📈 Badges de Couverture

### Frontend
![Frontend Coverage](https://img.shields.io/badge/coverage-frontend-blue)

### Backend
![Backend Coverage](.github/badges/jacoco.svg)
![Branches Coverage](.github/badges/branches.svg)

## 🛠️ Configuration

### Frontend (`karma.conf.js`)
```javascript
coverageReporter: {
  dir: './coverage/pjm-frontend-app',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' },
    { type: 'lcov' },
    { type: 'json' }
  ]
}
```

### Backend (`pom.xml`)
```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.12</version>
  <configuration>
    <rules>
      <rule>
        <limits>
          <limit>
            <minimum>0.50</minimum>
          </limit>
        </limits>
      </rule>
    </rules>
  </configuration>
</plugin>
```

## 📝 Interpréter les Rapports

### Métriques Clés

**Lignes (Lines)** : Pourcentage de lignes de code exécutées
- 🟢 ≥ 80% : Excellente couverture
- 🟡 50-79% : Couverture acceptable
- 🔴 < 50% : Couverture insuffisante

**Branches** : Pourcentage de chemins conditionnels testés
- Important pour les `if`, `switch`, `try-catch`

**Fonctions** : Pourcentage de fonctions/méthodes appelées

### Zones Non Couvertes

Les rapports HTML mettent en évidence :
- 🔴 **Rouge** : Code non exécuté
- 🟡 **Jaune** : Branches partiellement couvertes
- 🟢 **Vert** : Code entièrement couvert

## 🎯 Améliorer la Couverture

### Priorités
1. **Contrôleurs/Components** : Logique métier principale
2. **Services** : Appels API et traitement de données
3. **Modèles** : Validation et transformation
4. **Utilitaires** : Fonctions helper

### Bonnes Pratiques
- ✅ Tester les cas nominaux ET les cas d'erreur
- ✅ Couvrir toutes les branches conditionnelles
- ✅ Tester les cas limites (null, vide, max)
- ✅ Mocker les dépendances externes

## 🚫 Exclusions

### Frontend
Fichiers exclus par défaut :
- `*.spec.ts` - Fichiers de tests
- `*.module.ts` - Modules Angular
- `environment*.ts` - Configurations

### Backend
Packages exclus :
- `**/config/**` - Configuration Spring
- `**/dto/**` - Data Transfer Objects
- `**/entity/**` - Entités JPA (optionnel)

## 📚 Ressources

- [Karma Coverage](https://karma-runner.github.io/latest/config/coverage.html)
- [JaCoCo Documentation](https://www.jacoco.org/jacoco/trunk/doc/)
- [Codecov](https://docs.codecov.com/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)

## 🔧 Troubleshooting

### Frontend : "No coverage information"
```bash
# Vérifier que karma-coverage est installé
npm list karma-coverage

# Réinstaller si nécessaire
npm install --save-dev karma-coverage
```

### Backend : "JaCoCo report not generated"
```bash
# Vérifier la phase Maven
mvn clean test  # ❌ Ne génère PAS le rapport
mvn clean verify  # ✅ Génère le rapport
```

### CI/CD : "Artifact not found"
- Vérifier que les tests s'exécutent sans erreur
- Vérifier les chemins dans le workflow
- Consulter les logs GitHub Actions
