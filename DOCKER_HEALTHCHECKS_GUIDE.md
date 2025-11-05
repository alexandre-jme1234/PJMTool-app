# 🏥 Guide des Healthchecks et Policies Docker

## 📋 Vue d'ensemble

Ce document explique les healthchecks et les policies de restart mis en place pour assurer la **résilience** et la **fiabilité** de l'application PJMTool.

## 🎯 Objectifs Pédagogiques

En tant que développeur junior, tu vas comprendre :
1. **Pourquoi** les healthchecks sont essentiels
2. **Comment** configurer des policies de restart
3. **Quand** utiliser chaque stratégie
4. **Comment** limiter les ressources pour éviter les surcharges

---

## 🏥 Healthchecks

### Qu'est-ce qu'un Healthcheck ?

Un healthcheck est une **vérification automatique** que Docker effectue pour savoir si ton conteneur fonctionne correctement. C'est comme prendre le pouls d'un patient.

### Pourquoi c'est important ?

- ✅ **Détection précoce** des problèmes
- ✅ **Redémarrage automatique** si nécessaire
- ✅ **Orchestration intelligente** (attend que les services soient prêts)
- ✅ **Monitoring** de l'état de santé

---

## 🔧 Configuration par Service

### 1. MariaDB (Base de données)

```yaml
healthcheck:
  test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
  interval: 30s      # Vérifie toutes les 30 secondes
  timeout: 10s       # Timeout après 10 secondes
  retries: 5         # 5 tentatives avant de marquer comme unhealthy
  start_period: 30s  # Période de grâce de 30s au démarrage
```

**Explication** :
- `healthcheck.sh` : Script fourni par l'image MariaDB
- `--connect` : Vérifie la connexion à la base
- `--innodb_initialized` : Vérifie que le moteur InnoDB est prêt
- **Pourquoi 5 retries ?** La base de données peut prendre du temps à démarrer

**Statut** :
- 🟢 **healthy** : La base répond correctement
- 🟡 **starting** : En cours de démarrage (start_period)
- 🔴 **unhealthy** : Échec après 5 tentatives

---

### 2. Backend (Spring Boot)

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s  # Plus long car Spring Boot met du temps à démarrer
```

**Explication** :
- Utilise **Spring Boot Actuator** pour exposer `/actuator/health`
- `curl -f` : Échoue si le code HTTP n'est pas 2xx
- **60s de start_period** : Spring Boot a besoin de temps pour initialiser

**Endpoint Actuator** :
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

**Dépendance** :
```yaml
depends_on:
  mariadb:
    condition: service_healthy  # Attend que MariaDB soit healthy
```

---

### 3. Frontend (Angular)

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4200"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s  # Angular dev server démarre rapidement
```

**Explication** :
- Vérifie simplement que le serveur Angular répond
- **40s de start_period** : Le temps de compiler l'application

**Dépendance** :
```yaml
depends_on:
  backend:
    condition: service_healthy  # Attend que le backend soit prêt
```

---

## 🔄 Policies de Restart

### Stratégies disponibles

| Policy | Comportement | Usage |
|--------|-------------|-------|
| `no` | Ne redémarre jamais | Tests, debug |
| `always` | Redémarre toujours | Services critiques |
| `unless-stopped` | Redémarre sauf si arrêté manuellement | Base de données |
| `on-failure:N` | Redémarre N fois en cas d'échec | Applications |

### Configuration par service

#### MariaDB
```yaml
restart: unless-stopped
```
**Pourquoi ?** La base de données doit rester disponible, même après un reboot du serveur.

#### Backend & Frontend
```yaml
restart: on-failure:3
```
**Pourquoi ?** 
- Redémarre automatiquement en cas d'erreur
- Limite à 3 tentatives pour éviter les boucles infinies
- Si ça échoue 3 fois, c'est qu'il y a un vrai problème

---

## 💾 Limites de Ressources

### Pourquoi limiter les ressources ?

Sans limites, un conteneur peut :
- 🔴 Consommer toute la RAM du serveur
- 🔴 Monopoliser le CPU
- 🔴 Faire crasher les autres services

### Configuration

```yaml
deploy:
  resources:
    limits:        # Maximum autorisé
      cpus: '1.0'
      memory: 512M
    reservations:  # Minimum garanti
      cpus: '0.5'
      memory: 256M
```

### Allocation par service

| Service | CPU Limit | Memory Limit | Justification |
|---------|-----------|--------------|---------------|
| MariaDB | 1.0 | 512M | Base de données modérée |
| Backend | 1.0 | 768M | JVM + Spring Boot |
| Frontend | 1.0 | 1G | Node.js + compilation Angular |

---

## 🔐 Améliorations de Sécurité

### 1. Utilisateur non-root

**Backend Dockerfile** :
```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

**Pourquoi ?** 
- Principe du **moindre privilège**
- Si un attaquant compromet le conteneur, il n'a pas les droits root

### 2. Volumes en lecture seule

```yaml
volumes:
  - ./backend/src:/app/src:ro  # :ro = read-only
```

**Pourquoi ?**
- Empêche les modifications accidentelles
- Protection contre les malwares

### 3. Multi-stage build

**Avantages** :
- ✅ Image finale plus légère (JRE au lieu de JDK)
- ✅ Pas d'outils de build en production
- ✅ Surface d'attaque réduite

---

## 📊 Monitoring des Healthchecks

### Commandes utiles

#### Voir l'état de santé
```bash
docker ps
```
Colonne `STATUS` affiche :
- `Up 2 minutes (healthy)`
- `Up 30 seconds (health: starting)`
- `Up 5 minutes (unhealthy)`

#### Inspecter un healthcheck
```bash
docker inspect --format='{{json .State.Health}}' pjmtool-backend | jq
```

#### Logs du healthcheck
```bash
docker inspect pjmtool-backend | grep -A 10 Health
```

#### Voir les tentatives échouées
```bash
docker events --filter 'event=health_status'
```

---

## 🚀 Ordre de Démarrage

Grâce aux healthchecks et `depends_on`, l'ordre est garanti :

```
1. MariaDB démarre
   └─ Healthcheck : Attend que la DB soit prête (30s)
   
2. Backend démarre (une fois MariaDB healthy)
   └─ Healthcheck : Attend que Spring Boot soit prêt (60s)
   
3. Frontend démarre (une fois Backend healthy)
   └─ Healthcheck : Attend que Angular soit prêt (40s)
```

**Temps total de démarrage** : ~2-3 minutes

---

## 🧪 Tester les Healthchecks

### 1. Simuler un service unhealthy

**Backend** :
```bash
# Arrêter temporairement Spring Boot dans le conteneur
docker exec pjmtool-backend pkill java
```

**Résultat** : Le conteneur redémarre automatiquement (policy `on-failure:3`)

### 2. Vérifier la cascade de dépendances

```bash
# Arrêter MariaDB
docker stop pjmtool-mariadb

# Observer : Backend devient unhealthy car il ne peut plus se connecter
docker ps
```

### 3. Tester manuellement un healthcheck

**Backend** :
```bash
docker exec pjmtool-backend curl -f http://localhost:8080/actuator/health
```

**Frontend** :
```bash
docker exec pjmtool-frontend curl -f http://localhost:4200
```

---

## 📈 Métriques et Alertes

### Avec Docker Compose

```bash
# Voir les stats en temps réel
docker stats

# Voir les événements
docker events --filter 'type=container'
```

### Avec Prometheus (avancé)

Spring Boot Actuator expose des métriques Prometheus :
```
http://localhost:8080/actuator/prometheus
```

---

## 🎓 Exercices Pratiques

### Exercice 1 : Modifier un healthcheck
1. Change l'intervalle du backend à 10s
2. Rebuild et observe la fréquence des vérifications
3. Remets à 30s

### Exercice 2 : Tester la résilience
1. Lance l'application : `docker-compose up -d`
2. Simule un crash : `docker exec pjmtool-backend pkill java`
3. Observe le redémarrage automatique
4. Vérifie les logs : `docker logs pjmtool-backend`

### Exercice 3 : Limites de ressources
1. Réduis la mémoire du backend à 256M
2. Lance l'application
3. Observe si elle démarre (spoiler : non, Spring Boot a besoin de plus)
4. Remets à 768M

---

## 🔍 Debugging

### Le conteneur est unhealthy

1. **Vérifier les logs** :
```bash
docker logs pjmtool-backend --tail 50
```

2. **Tester manuellement le healthcheck** :
```bash
docker exec pjmtool-backend curl -v http://localhost:8080/actuator/health
```

3. **Inspecter l'état** :
```bash
docker inspect pjmtool-backend | grep -A 20 Health
```

### Le conteneur redémarre en boucle

1. **Vérifier la policy** : `on-failure:3` limite à 3 tentatives
2. **Voir les logs de tous les redémarrages** :
```bash
docker logs pjmtool-backend --since 10m
```

3. **Désactiver temporairement le restart** :
```yaml
restart: "no"
```

---

## 📚 Ressources Complémentaires

- [Docker Healthcheck Documentation](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Docker Compose Healthcheck](https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck)

---

## ✅ Checklist de Production

Avant de déployer en production :

- [ ] Tous les services ont un healthcheck
- [ ] Les policies de restart sont configurées
- [ ] Les limites de ressources sont définies
- [ ] Les utilisateurs non-root sont utilisés
- [ ] Les volumes sensibles sont en lecture seule
- [ ] Les dépendances entre services sont correctes
- [ ] Les healthchecks ont été testés manuellement
- [ ] Les logs sont accessibles et lisibles

---

**Créé le** : 3 novembre 2025  
**Auteur** : Cascade AI  
**Contexte** : Formation DevOps - Containerisation
