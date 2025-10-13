
#! IMPORTS

from discord.ext import commands
from services.database import get_latest_war_logs, get_all_clan_members



#! COMMANDE "!TOP5"


#? INITIALISATION DE LA COMMANDE

class Top5(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.has_any_role("Chef de clan", "Adjoint", "Clash Bot")
    async def top5(self, ctx):
        try:

            #* RÉCUPÉRATION DES DONNÉES DE LA DERNIÈRE GUERRE DE CLAN
            war_logs = await get_latest_war_logs()

            if not war_logs:
                await ctx.send("Aucune donnée de guerre trouvée !")
                return

            #* RÉCUPÉRATION DES MEMBRES POUR LES RÔLES
            clan_members = await get_all_clan_members()
            clan_members_dict = {member["tag"]: member for member in clan_members}

            #* PARAMÉTRAGE DE LA COMMANDE
            sorted_participants = sorted(war_logs, key=lambda x: x.get("fame", 0), reverse=True)

            pseudo_replacements = {"خير ان شاء الله": "Manel"}

            role_translation = {
                "member": "Membre",
                "elder": "Ancien",
                "coLeader": "Adjoint",
                "leader": "Chef de clan"
            }

            war_id = war_logs[0]["war_id"]
            message = f"⚔️   **Top 5 de la semaine**   🗓   {war_id}   ⚔️\n\n"

            #* CRÉATION DU PODIUM AVEC GESTION DES ÉGALITÉS
            medals = [":first_place:", ":second_place:", ":third_place:", ":medal:", ":medal:"]
            podium_positions = []

            #* IDENTIFICATION DES 5 SCORES DISTINCTS LES PLUS ÉLEVÉS
            unique_scores = []

            for player in sorted_participants:
                score = player.get("fame", 0)

                if score not in unique_scores:
                    unique_scores.append(score)
                if len(unique_scores) == 5:
                    break

            #* CRÉATION DU PODIUM POSITION PAR POSITION
            for position in range(5):
                if position >= len(unique_scores):
                    break

                target_score = unique_scores[position]
                players_at_position = [p for p in sorted_participants if p.get("fame", 0) == target_score]

                #- AFFICHAGE DE LA POSITION
                if len(players_at_position) == 1:
                    #- UN SEUL JOUEUR À LADITE POSITION
                    player = players_at_position[0]
                    tag = player.get("tag")
                    name = clan_members_dict.get(tag, {}).get("name", "Inconnu")
                    fame = player.get("fame", 0)
                    role = clan_members_dict.get(tag, {}).get("role", "member")
                    role_name = role_translation.get(role, "Inconnu")

                    if name in pseudo_replacements:
                        name = pseudo_replacements[name]

                    promote_note = " ▫️ **Promotion ❗️**" if role == "member" else ""
                    message += f"{medals[position]} {name} ▫️ {fame} points ▫️ {role_name}{promote_note}\n\n"

                else:
                    #- PLUSIEURS JOUEURS À LADITE POSITION
                    message += f"{medals[position]} **Égalité ({len(players_at_position)} joueurs) :**\n"

                    for player in players_at_position:
                        tag = player.get("tag")
                        name = clan_members_dict.get(tag, {}).get("name", "Inconnu")
                        fame = player.get("fame", 0)
                        role = clan_members_dict.get(tag, {}).get("role", "member")
                        role_name = role_translation.get(role, "Inconnu")

                        if name in pseudo_replacements:
                            name = pseudo_replacements[name]

                        promote_note = " ▫️ **Promotion ❗️**" if role == "member" else ""
                        message += f"      ◦ {name} ▫️ {fame} points ▫️ {role_name}{promote_note}\n"
                    message += "\n"

            await ctx.send(message)

        except Exception as e:
            await ctx.send(f"Une erreur est survenue : {e}")



#? GESTION DES ERREURS POUR "!TOP5"

    @top5.error
    async def top5_error(ctx, error):
        if isinstance(error, commands.MissingAnyRole):
            await ctx.send("Désolé, vous n'avez pas le rôle nécessaire pour utiliser cette commande !")
        else:
            print(f"Erreur inconnue : {error}")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(Top5(bot))