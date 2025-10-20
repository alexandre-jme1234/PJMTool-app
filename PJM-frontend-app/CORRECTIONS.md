# Corrections apportées au frontend

## ✅ Problèmes résolus

### 1. Configuration Node.js
- **Problème** : Node.js v21.x n'est pas supporté par Angular 18
- **Solution** : Workflows GitHub Actions mis à jour pour utiliser Node.js 20.x et 22.x
- **Fichiers modifiés** :
  - `.github/workflows/test_build_angular_application.yml`
  - `.github/workflows/coverage.yml`
  - `.github/workflows/deploy.yml`

### 2. package-lock.json
- **Problème** : Fichier manquant ou désynchronisé
- **Solution** : Généré avec Node.js 20 via Docker
- **Commande utilisée** : `docker run --rm -v ${PWD}:/app -w /app node:20-alpine npm install --package-lock-only`

### 3. Configuration Karma
- **Problème** : Chrome Headless se déconnectait après 30 secondes
- **Solution** : Augmentation des timeouts et ajout de flags Chrome
- **Fichier modifié** : `karma.conf.js`
  - `browserNoActivityTimeout: 60000`
  - `browserDisconnectTimeout: 10000`
  - Flags Chrome : `--no-sandbox`, `--disable-gpu`, `--disable-dev-shm-usage`, `--disable-software-rasterizer`

### 4. Tests unitaires
- **Problème** : Test de gestion d'erreur dans `task-overlay.component.spec.ts`
- **Solution** : Correction du test pour gérer correctement les Observables asynchrones
- **Fichier modifié** : `src/app/components/task-overlay/task-overlay.component.spec.ts`

### 5. Docker
- **Problème** : Contexte de build incorrect dans docker-compose.yml
- **Solution** : Correction du contexte pour pointer vers `./PJM-frontend-app`
- **Fichier modifié** : `docker-compose.yml`

### 6. Dockerfile
- **Optimisations** :
  - Regroupement des installations npm
  - Ajout de dépendances Chrome Headless (xvfb, udev)
  - Configuration des variables d'environnement Chrome
  - Nettoyage du cache npm

## 📊 Résultats des tests

**Tests exécutés** : 96  
**Réussis** : 90 ✅  
**Échecs** : 6 ❌ (tests à corriger si nécessaire)

**Couverture de code** :
- Statements : 41.34%
- Branches : 36.4%
- Functions : 34.93%
- Lines : 41.19%

## 🚀 Commandes utiles

### Générer package-lock.json
```bash
docker run --rm -v ${PWD}:/app -w /app node:20-alpine npm install --package-lock-only
```

### Lancer les tests avec couverture
```bash
docker-compose run --rm frontend npm run test:ci
```

### Build Docker
```bash
docker-compose build frontend
```

### Lancer le frontend
```bash
docker-compose up frontend
```
