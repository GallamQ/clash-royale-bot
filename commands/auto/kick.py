
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
            underperformers = []
            total_players = len(war_logs)
            absent_count = 0
            new_members_count = 0
            processed_count = 0

            for player in war_logs:
                tag = player["tag"]
                name = clan_members_dict.get(tag, {}).get("name", "Inconnu")
                fame = player["fame"]

                #- GESTION DES ABSENTS
                if tag in absent_tags:
                    absent_count += 1
                    continue

                #- GESTION DES NOUVEAUX ARRIVANTS
                join_date_val = clan_members_dict.get(tag, {}).get("join_date")

                if isinstance(join_date_val, datetime):
                    join_date = join_date_val.date()
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

                if fame < quota:
                    underperformers.append({"name": name, "fame": fame})

            # Log de diagnostic
            print(f"=== DIAGNOSTIC KICK ===")
            print(f"Total joueurs: {total_players}")
            print(f"Absents: {absent_count}")
            print(f"Nouveaux membres: {new_members_count}")
            print(f"Joueurs traités: {processed_count}")
            print(f"Sous-performants: {len(underperformers)}")
            print(f"War start date: {war_start_date}")
            print(f"War ID: {war_id}")

            if underperformers:
                pseudo_replacements = {"خير ان شاء الله": "Manel"}
                message = f"**Liste des joueurs n'ayant pas atteint le quota ➡️🚪**\n\n"
                for player in underperformers:
                    name = pseudo_replacements.get(player['name'], player['name'])
                    fame = player['fame']
                    message += f"{name} ▫️ Points : {fame}\n"
                await ctx.send(message)
            else:
                await ctx.send(f"Tous les joueurs ont atteint le quota !")

        except Exception as e:
            await ctx.send(f"Une erreur est survenue: {e}")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(Kick(bot))