# CI/CD Pipeline Documentation

## 📋 Overview

Cette pipeline GitHub Actions automatise le processus de build, test et déploiement pour l'application Event Booking.

## 🚀 Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   BACKEND    │         │   FRONTEND   │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                        │                           │
│         ├─ Install & Cache       ├─ Install & Cache         │
│         │                        │                           │
│         ├─ Lint ─────────────────┼─ Lint                    │
│         │                        │                           │
│         ├─ Tests ────────────────┼─ Tests                   │
│         │                        │                           │
│         ├─ Build ────────────────┼─ Build                   │
│         │                        │                           │
│         └────────┬───────────────┘                           │
│                  │                                            │
│         ┌────────▼────────┐                                  │
│         │  Docker Build   │                                  │
│         │  & Push to Hub  │                                  │
│         └─────────────────┘                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Triggers

La pipeline se déclenche automatiquement sur :

- **Push** vers les branches :
  - `main`
  - `develop`
  - `EBA-*` (feature branches)

- **Pull Request** vers :
  - `main`
  - `develop`

## 📦 Jobs

### Backend Jobs

1. **backend-install**
   - Installation des dépendances
   - Mise en cache de `node_modules`
   - Cache key basé sur `package-lock.json`

2. **backend-lint**
   - Vérification du code avec ESLint
   - ❌ Échec si erreurs de lint

3. **backend-test**
   - Tests unitaires avec Jest
   - Tests e2e
   - Génération du coverage
   - ❌ Échec si tests échouent

4. **backend-build**
   - Build de l'application NestJS
   - Upload des artifacts (dist/)
   - ❌ Échec si build échoue

### Frontend Jobs

1. **frontend-install**
   - Installation des dépendances
   - Mise en cache de `node_modules`
   - Cache key basé sur `package-lock.json`

2. **frontend-lint**
   - Vérification du code avec ESLint
   - ❌ Échec si erreurs de lint

3. **frontend-test**
   - Tests avec Jest & React Testing Library
   - Génération du coverage
   - ❌ Échec si tests échouent

4. **frontend-build**
   - Build de l'application Next.js
   - Upload des artifacts (.next/)
   - ❌ Échec si build échoue

### Docker Jobs

**docker-build-push** (uniquement sur `main` et `develop`)
- Build des images Docker
- Push vers Docker Hub
- Tags :
  - `latest`
  - `{branch-name}`
- Images :
  - `eventzi-backend:latest`
  - `eventzi-frontend:latest`

## 🔐 Secrets Required

Configurer dans GitHub Repository Settings → Secrets and variables → Actions :

```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password
```

## ⚙️ Configuration

### Node.js Version
```yaml
NODE_VERSION: '20.x'
```

### Cache Strategy
- Les `node_modules` sont mis en cache pour accélérer les builds
- Cache invalidé automatiquement si `package-lock.json` change

## 📊 Success Criteria

La pipeline réussit si :
- ✅ Tous les lints passent (backend + frontend)
- ✅ Tous les tests passent (backend + frontend)
- ✅ Les builds réussissent (backend + frontend)
- ✅ Les images Docker sont créées (uniquement main/develop)

La pipeline échoue si :
- ❌ ESLint détecte des erreurs
- ❌ Un test échoue
- ❌ Le build échoue
- ❌ La création d'image Docker échoue

## 🔍 Monitoring

### Voir les logs
1. Aller sur GitHub → Actions
2. Sélectionner le workflow run
3. Cliquer sur un job pour voir les logs

### Artifacts
Les builds sont disponibles pendant 1 jour :
- `backend-build` → dist/
- `frontend-build` → .next/

## 🚦 Status Badge

Ajouter dans README.md :

```markdown
![CI/CD Pipeline](https://github.com/Ibrahim-Lmlilas/Event_Booking-Application/actions/workflows/ci-cd.yml/badge.svg)
```

## 📝 Commit Message Convention

Pour lier les commits aux tickets Jira :

```bash
git commit -m "EBA-75: Add linting configuration"
git commit -m "EBA-76: Implement unit tests for events service"
git commit -m "EBA-77: Configure production build"
```

## 🐛 Troubleshooting

### Cache issues
```bash
# Supprimer le cache GitHub Actions
# Settings → Actions → Caches → Delete
```

### Tests échouent localement mais passent en CI
```bash
# Vérifier les variables d'environnement
# Vérifier la version de Node.js
node --version  # Should be 20.x
```

### Docker push échoue
```bash
# Vérifier les secrets
# Settings → Secrets → DOCKER_USERNAME
# Settings → Secrets → DOCKER_PASSWORD
```

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)

## 🎓 Learning Points

1. **Parallel Execution**: Frontend et Backend s'exécutent en parallèle
2. **Fail Fast**: Si lint échoue, les tests ne s'exécutent pas
3. **Caching**: Réduit le temps d'exécution de ~50%
4. **Artifacts**: Permet de télécharger les builds pour inspection
5. **Docker Multi-stage**: Images optimisées pour production

---

**Dernière mise à jour**: 06/02/2026
**Auteur**: Ibrahim Lmlilas
**Projet**: Event Booking Application
