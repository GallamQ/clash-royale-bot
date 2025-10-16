# Clash Royale Bot

> Bot Discord automatisé pour la gestion d'un clan Clash Royale

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org) [![Discord.py](https://img.shields.io/badge/discord.py-2.0+-blue.svg)](https://discordpy.readthedocs.io/) [![Version](https://img.shields.io/badge/version-1.2.0-green.svg)](https://github.com/GallamQ/clash-royale-bot/releases) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Description

La gestion d'un clan implique un investissement personnel et du temps, mais ce dernier manque parfois à l'appel. Alors, lorsque j'ai entamé mon périple sur les sentiers de la programmation et que j'y ai découvert les API, il m'est venu l'idée de joindre l'utile à l'agréable : me donner la possibilité de gagner du temps grâce à l'automatisation.

Après quelques recherches et beaucoup d'interrogations, c'est sous la forme d'un bot Discord que j'allais mettre ce projet en place, me permettant également, au passage, de fournir un canal de discussion supplémentaire aux membres du clan désireux de s'y joindre.

Chaque semaine, le bot effectue un travail de veille sur les performances des membres durant la "guerre de clans". Une règle régit ceux-ci : chacun se doit de réaliser un minimum de 1600 points de guerre, sous peine de se voir exclure (ou rétrograder au rang inférieur). Une fois les résultats obtenus, je n'ai plus qu'à m'occuper des promotions et des exclusions au sein du clan.

---

## Fonctionnalités

### Commandes automatiques (tous les lundis)
- **Top 5 hebdomadaire** - Classement des meilleurs joueurs avec gestion des égalités
- **Analyse des performances** - Liste des joueurs à exclure ou rétrograder
- **Rapport des absents** - Suivi des membres en absence justifiée

### Commandes manuelles
- `!top5` - Affiche le podium de la semaine
- `!kick` - Analyse les performances et suggère les sanctions
- `!absence <tag> [date_début] [date_fin]` - Gestion des absences
- `!absents` - Liste des absents actuels

### Automatisations
- Synchronisation des données du clan
- Sauvegarde des résultats de guerre
- Notifications automatiques
- Veille des fins de guerre

---

## Installation

### Prérequis
- Python 3.8+
- PostgreSQL
- Token Discord Bot
- Clé API Clash Royale

### Configuration
1. Clonez le repository
```bash
git clone https://github.com/GallamQ/clash-royale-bot.git
cd clash-royale-bot
```

2. Installez les dépendances
```bash
pip install -r requirements.txt
```

3. Configurez les variables d'environnement
```env
DISCORD_TOKEN=votre_token_discord
CLASH_API_TOKEN=votre_token_clash_royale
DATABASE_URL=postgresql://user:password@localhost/dbname
CLAN_TAG=#votre_tag_clan
```

4. Lancez le bot
```bash
python main.py
```

---

## Structure du projet

```
clash-royale-bot/
├── commands/
│   ├── auto/          # Commandes automatiques
│   └── user/          # Commandes utilisateur
├── services/
│   ├── clash_api.py   # Interface API Clash Royale
│   ├── database.py    # Gestion base de données
│   └── scheduler.py   # Tâches automatiques
├── main.py           # Point d'entrée
└── requirements.txt  # Dépendances
```

---

## Utilisation

### Gestion des absences
```bash
# Marquer un joueur absent cette semaine
!absence #TAG

# Marquer absent avec dates spécifiques
!absence #TAG 15-10-2024 21-10-2024

# Retirer une absence
!absence #TAG remove
```

### Consultation des rapports
Les rapports sont publiés automatiquement chaque lundi, mais peuvent être consultés à tout moment avec les commandes manuelles.

---

## License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## Auteur

**GallamQ** - [GitHub](https://github.com/GallamQ)

## Remerciements

- [discord.py](https://discordpy.readthedocs.io/) pour l'interface Discord
- [Clash Royale API](https://developer.clashroyale.com/) pour les données du jeu

---

N'hésitez pas à star ⭐ le projet s'il vous est utile !