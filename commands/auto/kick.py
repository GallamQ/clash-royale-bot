
#! IMPORTS

from discord.ext import commands
from datetime import datetime
from services.database import get_latest_war_logs, get_all_clan_members, get_all_absences



#! COMMANDE "!KICK"

#? INITIALISATION DE LA COMMANDE

class Kick(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="kick")
    @commands.has_any_role("Chef de clan", "Adjoint", "Clash Bot")
    async def kick(self, ctx):
        quota = 1600

        try:
            #* RÉCUPÉRATION DES DONNÉES DE LA DERNIÈRE GUERRE DE CLAN
            war_logs = await get_latest_war_logs()
            if not war_logs:
                await ctx.send("Aucune donnée de guerre trouvée !")
                return

            #* RÉCUPÉRATION DE LA DATE DE LA DERNIÈRE GUERRE DE CLAN
            war_id = war_logs[0]["war_id"]

            if isinstance(war_id, str):
                war_start_date = datetime.strptime(war_id, "%d-%m-%Y").date()
            else:
                war_start_date = war_id

            #* RÉCUPÉRATION DES MEMBRES DU CLAN
            clan_members = await get_all_clan_members()
            clan_members_dict = {member["tag"]: member for member in clan_members}

            #* RÉCUPÉRATION DES ABSENCES
            absences = await get_all_absences()
            absent_tags = {absence["tag"] for absence in absences}

            #* PARAMÉTRAGE DE LA COMMANDE
            underperformers_to_kick = []
            underperformers_to_demote = []
            total_players = len(war_logs)
            absent_count = 0
            new_members_count = 0
            processed_count = 0
            excluded_leaders_count = 0
            
            role_translation = {
                "member": "Membre",
                "elder": "Ancien",
                "coLeader": "Adjoint",
                "leader": "Chef de clan"
            }

            for player in war_logs:
                tag = player["tag"]
                name = clan_members_dict.get(tag, {}).get("name", "Inconnu")
                fame = player["fame"]
                role = clan_members_dict.get(tag, {}).get("role", "member")

                #- GESTION DES ABSENTS
                if tag in absent_tags:
                    absent_count += 1
                    continue
                
                #- GESTION DES ADJOINTS ET DU CHEF DE CLAN
                if role in ["coLeader", "leader"]:
                    excluded_leaders_count += 1
                    continue

                #- GESTION DES NOUVEAUX ARRIVANTS
                join_date_val = clan_members_dict.get(tag, {}).get("join_date")

                if processed_count + new_members_count < 5:
                    print(f"{name} - join_date_val: {join_date_val} (type: {type(join_date_val)})")

                if isinstance(join_date_val, datetime):
                    join_date = join_date_val.date()
                elif isinstance(join_date_val, type(datetime.now().date())):
                    join_date = join_date_val
                elif hasattr(join_date_val, 'date'):
                    join_date = join_date_val
                elif isinstance(join_date_val, str):
                    try:
                        join_date = datetime.strptime(join_date_val, "%Y-%m-%d").date()
                    except ValueError:
                        try:
                            join_date = datetime.strptime(join_date_val, "%d-%m-%Y").date()
                        except Exception:
                            join_date = None
                else:
                    join_date = None

                if processed_count + new_members_count < 10:
                    print(f"{name} - join_date_val: {join_date_val} -> join_date: {join_date} (war_start: {war_start_date})")

                if not join_date or join_date >= war_start_date:
                    new_members_count += 1
                    continue

                processed_count += 1

                #- VÉRIFICATION DU QUOTA ET PRISE DE DÉCISION
                if fame < quota:
                    role_name = role_translation.get(role, "Inconnu")
                    
                    if role == "member":
                        underperformers_to_kick.append({
                            "name": name,
                            "fame": fame,
                            "role": role_name
                        })

                    elif role == "elder":
                        underperformers_to_demote.append({
                            "name": name,
                            "fame": fame,
                            "role": role_name
                        })

            #* AFFICHAGE DES RÉSULTATS
            pseudo_replacements = {"خير ان شاء الله": "Manel"}
            
            if underperformers_to_kick or underperformers_to_demote:
                message = f"**Liste des joueurs n'ayant pas atteint le quota ➡️🚪**\n\n"

                #- LISTE DES JOUEURS À KICK
                if underperformers_to_kick:
                    message += f"**🚪 À KICKER ({len(underperformers_to_kick)}) :**\n"

                    for player in underperformers_to_kick:
                        name = pseudo_replacements.get(player['name'], player['name'])
                        message += f"❌ {name} ▫️ {player['fame']} pts ▫️ {player['role']}\n"
                    message += "\n"

                #- LISTE DES JOUEURS À DEMOTE
                if underperformers_to_demote:
                    message += f"**⬇️ À RÉTROGRADER (Ancien → Membre) ({len(underperformers_to_demote)}) :**\n"

                    for player in underperformers_to_demote:
                        name = pseudo_replacements.get(player['name'], player['name'])
                        message += f"⚠️ {name} ▫️ {player['fame']} pts ▫️ {player['role']}\n"

                await ctx.send(message)
            else:
                await ctx.send(f"✅ Tous les joueurs ont atteint le quota !")

        except Exception as e:
            await ctx.send(f"Une erreur est survenue: {e}")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(Kick(bot))