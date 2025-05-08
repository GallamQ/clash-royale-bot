<!-- ! COMMANDES ! -->

<!-- ? MESSAGE DE BIENVENUE | AUTOMATIQUE ? -->

Événement : welcome

<!-- * IMPLÉMENTÉ * -->
- Mise en place d'un message de bienvenue automatique.


<!-- ? TOP 5 DE LA GUERRE EN COURS | AUTOMATIQUE ? -->

Commande : !top5

<!-- * IMPLÉMENTÉ * -->
- Enregistrement des données de guerre dans un fichier .json;
- Récupération des données de guerre dans le fichier .json;
- Affichage des 5 meilleurs joueurs de la guerre.

<!-- ? HISTORIQUE DES GUERRES DE CLAN ? -->

Commande : !lastwar [n]

- Nécessité de réaliser un fichier .json afin d'y stocker les logs des guerres passées. L'endpoint "/warlog", initialement proposée par l'API Clash Royale, est désactivé jusqu'à nouvel ordre.


<!-- ? LISTE DES MEMBRES À KICK ? | AUTOMATIQUE -->

Commande : !kick

<!-- * IMPLÉMENTÉ * -->
- Enregistrement des données de guerre dans un fichier .json;
- Récupération des données de guerre dans le fichier .json;
- Affichage des joueurs n'ayant pas atteint le quota de 1600 points.

<!-- TODO: POSSIBILITÉS D'AMÉLIORATION -->
- Prise en compte des joueurs arrivés durant la guerre et n'ayant pas eu l'occasion d'atteindre le quota;


<!-- ? LISTE DES MEMBRES ABSENTS ? -->

!absence [n] [x]






Commandes automatiques :
- !top5
- !kick
- !welcome

Commandes à utiliser :
- !absence
- !GDC
- !help
