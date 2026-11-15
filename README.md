# Clash Royale Clan Bot

> A Discord bot that automates the weekly administration of a Clash Royale clan.

[![TypeScript](https://img.shields.io/badge/TypeScript-7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

🇫🇷 [Version française](#version-française) en bas de page.

---

## About

Running a clan takes time and personal investment, and that time is not always available. When I started learning to program and discovered APIs, I saw a chance to combine the useful with the enjoyable: automate the tedious part of clan management.

The result is a Discord bot that watches the clan's performance during the weekly "clan war" and posts ready-to-use reports in Discord. It also gives clan members one more place to talk. I now only have to act on the results (promotions, demotions, kicks).

The project started in Python and was rewritten in TypeScript, with the business rules extracted into small pure functions covered by tests.

---

## Features

**Automatic, every week**
- War podium: top 3 with ties handled
- Sanction list: who gets demoted or kicked, based on a joker system
- Joker losses report
- Cleanup of expired absences

**Automatic, behind the scenes**
- Daily snapshot of the clan roster (joins and departures)
- Several captures of the war scores during the day change, then a freeze of the final results. The bot looks at the data instead of trusting a fixed hour, because the war can end at a different time each week (and summer/winter time moves it too)

**Manual**
- `/absence` slash command to declare, change or remove a member's absence

---

## How it works

There is no always-on Discord gateway bot. Scheduled jobs run small scripts, and a minimal web server answers Discord's slash command requests.

```
systemd timers ──► jobs (src/jobs) ──► Clash Royale API
                        │
                        ├──► PostgreSQL (src/db)
                        └──► Discord webhooks (reports)

Discord /absence ──► Express server (src/server) ──► PostgreSQL
```

- **Timers**: the schedule lives in `deploy/systemd/` (one `.service` and one `.timer` per job, plus a failure notifier).
- **Business rules**: everything that decides something (podium, jokers, exemptions, war dates...) lives in `src/rules/` as pure functions with no network or database access, which makes them easy to test.
- **Messages**: `src/messages/` formats the Discord messages.
- **Failures**: a job that fails sends an alert to a dedicated webhook.

---

## Clan rules in short

- **Podium**: the top 3 scores of the war (ties included). Zero points never reach the podium. Members on the podium are promoted to elder.
- **Sanction**: scoring strictly 0 points in a war.
- **Jokers**: an elder has 1 joker, a member has 3. Each zero consumes one; the sanction falls on the next one (demotion for an elder, kick for a member).
- **Recovery**: a member earns a joker back after 4 consecutive wars with points. An elder gets it back by reaching the podium again.
- **Neutral wars**: a declared absence, or joining the clan during the war, neither consumes a joker nor counts toward a streak.

---

## Project structure

```
clan-bot-ts/
├── src/
│   ├── api/        # Clash Royale API client
│   ├── db/         # PostgreSQL queries
│   ├── jobs/       # Scheduled scripts (snapshot, freeze, reports...)
│   ├── rules/      # Pure business rules
│   ├── messages/   # Discord message formatting
│   ├── server/     # Express server for slash commands
│   ├── checks/     # Manual verification scripts
│   ├── admin/      # Slash command registration
│   ├── types/      # Shared types
│   └── utils/      # Small helpers
├── tests/          # Unit tests (mirror of src/)
├── sql/            # Numbered database migrations
└── deploy/systemd/ # Timers and services
```

---

## Getting started

### Requirements

- Node.js 24 (the version the bot runs on)
- PostgreSQL
- A [Clash Royale API](https://developer.clashroyale.com/) key (bound to the IP address that calls it)
- A Discord application (bot token, public key) and webhook URLs

### Installation

```bash
git clone https://github.com/GallamQ/clash-royale-bot.git
cd clash-royale-bot
npm install
```

### Configuration

Create a `.env` file:

```env
# Clash Royale
API_KEY=your_clash_royale_api_key
CLAN_TAG=#YOURCLANTAG

# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# Discord application (slash commands)
DISCORD_APP_ID=...
DISCORD_PUBLIC_KEY=...
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
PORT=3000

# Discord webhooks: DISCORD_WEBHOOK_URL is the default channel,
# the others are optional and override it per report
DISCORD_WEBHOOK_URL=...
PODIUM_WEBHOOK_URL=...
KICK_LIST_WEBHOOK_URL=...
JOKER_LOSSES_WEBHOOK_URL=...
ABSENCES_WEBHOOK_URL=...
ALERT_WEBHOOK_URL=...

# Optional: print messages instead of sending them
# DRY_RUN=1
```

### Database

Apply the migrations of `sql/` in numerical order:

```bash
for f in sql/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

### Development

```bash
npm test          # run the tests
npm run typecheck # TypeScript check
npm run format    # Prettier check
```

---

## License

This project is released under the MIT license. See [LICENSE](LICENSE).

## Author

**Quentin "Gallam" Detré**, [GitHub](https://github.com/GallamQ)

## Acknowledgements

- [Clash Royale API](https://developer.clashroyale.com/) for the game data
- [Discord](https://discord.com/developers/docs) for the interactions and webhooks

---

<details>
<summary id="version-française">🇫🇷 Version française</summary>

## À propos

Gérer un clan demande du temps et de l'investissement personnel, et ce temps manque parfois. Quand j'ai commencé à apprendre la programmation et découvert les API, j'ai voulu joindre l'utile à l'agréable : automatiser la partie fastidieuse de la gestion du clan.

Le résultat est un bot Discord qui surveille les performances du clan pendant la « guerre de clans » hebdomadaire et publie des rapports prêts à l'emploi. Il offre aussi aux membres un canal de discussion de plus. Il ne me reste qu'à agir sur les résultats (promotions, rétrogradations, exclusions).

Le projet est né en Python avant d'être réécrit en TypeScript, avec les règles de gestion isolées dans de petites fonctions pures couvertes par des tests.

## Fonctionnement

Pas de bot connecté en permanence à Discord : des tâches planifiées (timers systemd) lancent de petits scripts, et un mini serveur web répond à la commande `/absence`.

- **Chaque semaine** : podium (top 3, égalités comprises), liste des sanctions selon le système de jokers, jokers perdus, nettoyage des absences terminées.
- **En coulisses** : photo quotidienne du roster, captures répétées des scores pendant le changement de jour puis gel des résultats finaux. Le bot se fie aux données plutôt qu'à une heure fixe, car la fin de guerre tombe à des instants différents d'une semaine à l'autre.
- **Règles** : 0 point en guerre = un joker consommé (1 pour un aîné, 3 pour un membre), sanction au suivant. Un membre récupère un joker après 4 guerres consécutives avec des points ; un aîné en refaisant un podium. Absence déclarée ou arrivée en cours de guerre = guerre neutre.

Pour l'installation, voir les sections *Getting started* et *Project structure* ci-dessus.

</details>
