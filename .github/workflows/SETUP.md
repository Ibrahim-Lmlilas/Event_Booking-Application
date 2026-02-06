# CI/CD Setup Guide

## 📦 GitHub Secrets Configuration

Pour que la pipeline CI/CD fonctionne correctement, vous devez configurer les secrets GitHub suivants :

### 1. Accéder aux Secrets

1. Aller sur votre repository GitHub: `https://github.com/Ibrahim-Lmlilas/Event_Booking-Application`
2. Cliquer sur **Settings** (en haut à droite)
3. Dans le menu de gauche, cliquer sur **Secrets and variables** → **Actions**
4. Cliquer sur **New repository secret**

### 2. Créer les Secrets Requis

#### DOCKER_USERNAME
- **Name**: `DOCKER_USERNAME`
- **Value**: Votre nom d'utilisateur Docker Hub (ex: `ibrahimlmlilas`)

#### DOCKER_PASSWORD
- **Name**: `DOCKER_PASSWORD`  
- **Value**: Votre mot de passe Docker Hub ou Access Token

> **💡 Recommandation**: Utiliser un Access Token au lieu du mot de passe
> 
> Pour créer un Access Token:
> 1. Se connecter à [Docker Hub](https://hub.docker.com)
> 2. Aller dans **Account Settings** → **Security**
> 3. Cliquer sur **New Access Token**
> 4. Donner un nom (ex: "GitHub Actions CI/CD")
> 5. Copier le token généré

### 3. Vérifier la Configuration

Une fois les secrets ajoutés, votre écran devrait afficher :
```
DOCKER_USERNAME     Updated X minutes ago
DOCKER_PASSWORD     Updated X minutes ago
```

## 🚀 Tester la Pipeline

### Option 1: Push vers une branche feature
```bash
git checkout -b EBA-XX-feature-name
# Make changes...
git add .
git commit -m "EBA-XX: Feature description"
git push origin EBA-XX-feature-name
```

### Option 2: Créer une Pull Request
```bash
# Depuis votre branche feature
gh pr create --base main --title "EBA-XX: Feature title"
```

### Option 3: Push vers main/develop (déclenche Docker build)
```bash
git checkout main
git merge EBA-XX-feature-name
git push origin main
```

## 📊 Monitorer la Pipeline

1. Aller sur l'onglet **Actions** du repository
2. Voir les workflows en cours d'exécution
3. Cliquer sur un workflow pour voir les détails
4. Vérifier les logs de chaque job

### Jobs Exécutés

#### Frontend
- ✅ Install Dependencies (avec cache)
- ✅ Lint (max 50 warnings)
- ✅ Tests (Jest + React Testing Library)
- ✅ Build (Next.js)

#### Backend
- ✅ Install Dependencies (avec cache)
- ✅ Lint (max 250 warnings)
- ✅ Tests (Jest unit + e2e)
- ✅ Build (NestJS)

#### Docker (main/develop uniquement)
- ✅ Build Backend Image
- ✅ Build Frontend Image
- ✅ Push to Docker Hub

## 🔍 Vérifier les Images Docker

Après un push réussi vers `main` ou `develop`, vérifier que les images sont sur Docker Hub:

```bash
# Backend
docker pull YOUR_USERNAME/eventzi-backend:latest

# Frontend
docker pull YOUR_USERNAME/eventzi-frontend:latest
```

## ❌ Troubleshooting

### Erreur: "Docker login failed"
- Vérifier que `DOCKER_USERNAME` et `DOCKER_PASSWORD` sont correctement configurés
- Si vous utilisez un Access Token, vérifier qu'il est toujours valide

### Erreur: "Lint failed"
- Lancer `npm run lint -- --fix` localement
- Commit les changements

### Erreur: "Tests failed"
- Lancer `npm test` localement pour identifier les tests qui échouent
- Fixer les tests et recommit

### Erreur: "Build failed"
- Vérifier les erreurs de compilation
- S'assurer que toutes les dépendances sont installées
- Vérifier les variables d'environnement

## 📈 Optimisations Futures

- [ ] Ajouter code coverage reporting
- [ ] Implémenter deployment automatique vers production
- [ ] Ajouter notifications Slack/Discord sur échec
- [ ] Configurer branch protection rules
- [ ] Ajouter semantic versioning automatique
- [ ] Implémenter changelog automatique

---

**Créé par**: Ibrahim Lmlilas  
**Date**: 06/02/2026  
**Jira Epic**: EBA-74 - Frontend & Backend Build
