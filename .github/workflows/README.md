# CI/CD Pipeline

GitHub Actions pipeline for build, tests, and Docker deployment of the Event Booking application.

## Overview

```
Backend (NestJS)     Frontend (Next.js)
       │                      │
       ├─ Install & Cache     ├─ Install & Cache
       ├─ Lint                ├─ Lint
       ├─ Tests               ├─ Tests
       ├─ Build               ├─ Build
       └──────────┬───────────┘
                  │
           Docker Build & Push
```

## Triggers

| Event | Branches |
|-------|----------|
| Push | main, develop, EBA-* |
| Pull Request | main, develop |

## Jobs

| Job | Description |
|-----|-------------|
| backend-install | Install + cache node_modules |
| backend-lint | ESLint |
| backend-test | Jest unit + e2e |
| backend-build | NestJS build |
| frontend-install | Install + cache |
| frontend-lint | ESLint |
| frontend-test | Jest + React Testing Library |
| frontend-build | Next.js build |
| docker-build-push | Build & push images (main/develop only) |

## Required Secrets

In **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| DOCKER_USERNAME | Docker Hub username |
| DOCKER_PASSWORD | Password or Access Token |

## Quick Setup

1. Create DOCKER_USERNAME and DOCKER_PASSWORD secrets
2. Push to an EBA-* or main/develop branch
3. Monitor execution in the Actions tab

## Troubleshooting

- **Tests fail**: Check Node 20.x, env variables
- **Docker push fails**: Verify secrets
- **Cache issues**: Settings → Actions → Caches → Delete

## Resources

- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
