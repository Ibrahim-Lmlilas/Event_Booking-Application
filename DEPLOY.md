# Guide de Déploiement sur Render

Ce guide vous explique comment déployer l'application Event Booking sur Render.

## Prérequis

1. Un compte Render (gratuit) : https://render.com
2. Un compte GitHub avec le repository de l'application
3. MongoDB (inclus dans Render ou MongoDB Atlas)

## Structure du Projet

- **Backend API** : NestJS (`apps/api`)
- **Frontend Web** : Next.js (`apps/web`)
- **Base de données** : MongoDB

## Étapes de Déploiement

### 1. Préparer le Repository GitHub

Assurez-vous que votre code est poussé sur GitHub :

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Créer les Services sur Render

#### Option A : Utiliser render.yaml (Recommandé)

1. Connectez votre compte GitHub à Render
2. Dans le dashboard Render, cliquez sur "New" → "Blueprint"
3. Collez le contenu du fichier `render.yaml` ou importez-le depuis votre repo
4. Render créera automatiquement les 3 services :
   - API Backend
   - Web Frontend
   - MongoDB Database

#### Option B : Créer les Services Manuellement

##### 2.1. Créer la Base de Données MongoDB

1. Cliquez sur "New" → "PostgreSQL" (ou "MongoDB" si disponible)
2. Nommez-le : `event-booking-db`
3. Sélectionnez le plan "Free"
4. Notez la connection string MongoDB

##### 2.2. Créer le Service API Backend

1. Cliquez sur "New" → "Web Service"
2. Connectez votre repository GitHub
3. Configurez :
   - **Name** : `event-booking-api`
   - **Environment** : `Node`
   - **Region** : `Frankfurt` (ou le plus proche)
   - **Branch** : `main`
   - **Root Directory** : `apps/api`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run start:prod`
   - **Plan** : `Free`

4. Ajoutez les Variables d'Environnement :
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<votre-connection-string-mongodb>
   JWT_SECRET=<générez-une-clé-secrète-aléatoire>
   CORS_ORIGIN=https://event-booking-web.onrender.com
   ```

5. Cliquez sur "Create Web Service"

##### 2.3. Créer le Service Web Frontend

1. Cliquez sur "New" → "Web Service"
2. Connectez le même repository GitHub
3. Configurez :
   - **Name** : `event-booking-web`
   - **Environment** : `Node`
   - **Region** : `Frankfurt`
   - **Branch** : `main`
   - **Root Directory** : `apps/web`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Plan** : `Free`

4. Ajoutez les Variables d'Environnement :
   ```
   NODE_ENV=production
   PORT=10000
   NEXT_PUBLIC_API_URL=https://event-booking-api.onrender.com/api
   ```

5. Cliquez sur "Create Web Service"

### 3. Configurer les URLs

Une fois les services déployés :

1. **Notez l'URL de l'API** : `https://event-booking-api.onrender.com`
2. **Notez l'URL du Web** : `https://event-booking-web.onrender.com`

3. **Mettez à jour les variables d'environnement** :
   - Dans le service **API** : Mettez à jour `CORS_ORIGIN` avec l'URL du Web
   - Dans le service **Web** : Mettez à jour `NEXT_PUBLIC_API_URL` avec l'URL de l'API

### 4. Vérifier le Déploiement

1. Attendez que les builds se terminent (5-10 minutes)
2. Visitez l'URL du Web : `https://event-booking-web.onrender.com`
3. Testez la connexion :
   - Email : `admin@eventzi.com`
   - Password : `Admin@123`

## Commandes Utiles

### Vérifier les Logs

Dans le dashboard Render, cliquez sur votre service → "Logs"

### Redémarrer un Service

Dans le dashboard Render, cliquez sur votre service → "Manual Deploy" → "Deploy latest commit"

### Mettre à Jour les Variables d'Environnement

Dans le dashboard Render, cliquez sur votre service → "Environment" → Ajoutez/modifiez les variables

## Notes Importantes

1. **Plan Gratuit** : Les services gratuits s'endorment après 15 minutes d'inactivité. Le premier démarrage peut prendre 30-60 secondes.

2. **MongoDB** : Si vous utilisez MongoDB Atlas au lieu de Render, utilisez la connection string Atlas dans `MONGODB_URI`.

3. **CORS** : Assurez-vous que `CORS_ORIGIN` dans l'API correspond exactement à l'URL du frontend.

4. **Admin User** : L'admin est créé automatiquement au démarrage de l'API avec :
   - Email : `admin@eventzi.com`
   - Password : `Admin@123`

5. **Build Time** : Le premier build peut prendre 10-15 minutes. Les builds suivants sont plus rapides grâce au cache.

## Dépannage

### L'API ne démarre pas
- Vérifiez les logs dans Render
- Vérifiez que `MONGODB_URI` est correct
- Vérifiez que `PORT` est défini

### Le Frontend ne peut pas se connecter à l'API
- Vérifiez que `NEXT_PUBLIC_API_URL` est correct
- Vérifiez que `CORS_ORIGIN` dans l'API correspond à l'URL du frontend
- Vérifiez les logs de l'API pour les erreurs CORS

### Erreur 404 sur les routes
- Vérifiez que le build s'est terminé avec succès
- Vérifiez que les fichiers sont dans le bon répertoire

## Support

Pour plus d'aide, consultez la documentation Render : https://render.com/docs
