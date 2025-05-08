
#! IMPORTS

import os
import json
from discord.ext import commands
from datetime import datetime



#! COMMANDE "!KICK"

#? INITIALISATION DES VARIABLES

WAR_LOG_FILE = os.path.join(os.path.dirname(__file__), "../data/warlog_backup.json")
CLAN_MEMBERS_FILE = os.path.join(os.path.dirname(__file__), "../data/clan_members.json")
ABSENCE_FILE = os.path.join(os.path.dirname(__file__), "../data/absences.json")


#? INITIALISATION DE LA COMMANDE

class Kick(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="kick")
    @commands.has_any_role("Clash Bot")
    async def kick(self, ctx):
        quota = 1600
        war_start_date = datetime.strptime("%d-%m-%Y %H:%M:%S")

        try:
            #* RÉCUPÉRATION DES DONNÉES DE LA DERNIÈRE GUERRE DE CLAN
            with open(WAR_LOG_FILE, "r", encoding="utf-8") as f:
                war_data = json.load(f)
            
            latest_war = war_data[0]
            participants = latest_war["clan"]["participants"]

            #* RÉCUPÉRATION DES DONNÉES DES MEMBRES DU CLAN
            if os.path.exists(CLAN_MEMBERS_FILE):
                with open(CLAN_MEMBERS_FILE, "r", encoding="utf-8") as f:
                    clan_data = json.load(f)
                    clan_members = {member["tag"]: member for member in clan_data["members"]}
            else:
                await ctx.send("Le fichier `clan_members.json` est introuvable !")
                return

            #* RÉCUPÉRATION DES DONNÉES DES MEMBRES ABSENTS
            if os.path.exists(ABSENCE_FILE):
                with open(ABSENCE_FILE, "r", encoding="utf-8") as f:
                    absences = json.load(f)
            else:
                absences = {}

            #* PARAMÉTRAGE DE LA COMMANDE
            underperformers = []
            for player in participants:
                name = player.get("name", "Inconnu")
                tag = player.get("tag", "Inconny")
                fame = player.get("fame", 0)

                if tag in absences and absences[tag]["wars_left"] > 0:
                    continue

                if tag in clan_members:
                    join_date = datetime.strptime(clan_members[tag]["join_date"], "%d-%m-%Y")
                    if join_date >= war_start_date:
                        continue

                if fame < quota:
                    underperformers.append(player)

            if underperformers:
                message = f"**Liste des joueurs n'ayant pas atteint le quota de {quota} points:**\n"
                for player in underperformers:
                    message += f"- {player['name']} | Points : {player['fame']}\n"
                await ctx.send(message)
            else:
                await ctx.send(f"Tous les joueurs ont atteind le quota ! Félicitations à tous.")

        except FileNotFoundError as e:
            await ctx.send(f"Fichier introuvable : {e}")
        except Exception as e:
            await ctx.send(f"Une erreur est survenue: {e}")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(Kick(bot))