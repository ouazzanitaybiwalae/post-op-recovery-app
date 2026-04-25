# Application de Suivi Post-Opératoire
 
Application de suivi personnalisé des patients en période post-opératoire avec détection précoce des complications.
 
## Fonctionnalités
 
- Parcours de récupération personnalisés
- Questionnaires quotidiens automatiques
- Guidance d'exercices avec vidéos
- Détection automatique des complications
- Coordination de l'équipe médicale
 
## Architecture
 
Architecture microservices avec 5 services indépendants :
 
1. **Recovery Plan Service** (Port 3001) - Gestion des parcours
2. **Questionnaire Service** (Port 3002) - Quiz et analyse
3. **Exercise Service** (Port 3003) - Exercices et vidéos
4. **Alert Service** (Port 3004) - Détection complications
5. **Coordination Service** (Port 3005) - Communication équipe
 
## Installation
 
### Prérequis
- Docker Desktop
- Node.js 18+ (optionnel pour dev local)
- Git
 
### Lancement avec Docker
 
```bash
# Cloner le projet
git clone https://github.com/votre-repo/post-operative-care-app.git
cd post-operative-care-app
 
# Lancer tous les services
docker-compose up --build
 
# Accéder à l'application
Frontend: http://localhost:3000
