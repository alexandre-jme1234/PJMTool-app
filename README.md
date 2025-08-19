PJMTool-app

Le projet permet d'éditer des projets et des taches pour des utilisateurs connectés. Chaque utlisateur créé à des droits d'écriture et de lecture différents selon le role qui lui a été assigné à la création.
Installation du projet

Le projet est encore en cours de développement et certaines erreurs seront fixées dans les jours à venir.

Le backend est réalisé en Spring Boot en JAVA, pour le construire il suffit de lancer la commande suivante à la racine du projet :

docker compose up --build

Par defaut le front end est généré dans un service du docker-compose. Toutefois, je vous encourage à installer angular v18 et exécuter dans le dossier ./PJM-frontend-app les commandes suivantes :

npm install

ng build

ng serve --proxy-config proxy.conf.json
Cas test

Pour créer un projet, cliquer sur le boutton + à coté de l'intitulé projets.

Renseigner le nom du projet suivi et l'utilisateur par defaut : arthur .

Vous verrez alors un projet s'afficher dans la colonne des projets. Cliquez sur le projet pour le sélectionner et le bouton + de la colonne tache pour créer une nouvelle tache en renseignant l'id user 1 qui correspond à l'id d'user par defaut.

En cliquant sur l'intitulé "voir le projet" pret du titre du projet vous découvrirez un tableau kanban avec un drag and drop de card tache.

Pour modifier la priorité d'une tache, il est necessaire de drag and drop à deux reprises une tache vers une colonne adjacente pour voir sa modification de colonne.

A partir de la vue Dashboard, vous pouvez modifier, ajouter ou supprimer autant de projets que vous le souhaitez.

La création d'users ainsi que leurs assignation sur des projets est encore en cours de développement.
Remerciement

Je vous remercie pour le temps que vous consacrerez à l'analyse de mon code et j'espère que vous prendrez plaisir à utiliser cette solution.
