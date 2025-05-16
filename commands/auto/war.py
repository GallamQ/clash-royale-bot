
#! IMPORTS

from datetime import datetime
from discord.ext import commands
from services.clash_api import get_clan_war_data
from services.database import get_all_clan_members


#! COMMANDE "!WAR"

#? INITIALISATION DE LA COMMANDE

class War(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def war(self, ctx):
        try:
            #* RÉCUPÉRATION DES DONNÉES DE LA GUERRE EN COURS
            war_logs = await get_clan_war_data()

            if not war_logs:
                await ctx.send("Aucune donnée de guerre trouvée !")
                return

            #* RÉCUPÉRATION DES MEMBRES DU CLAN
            clan_members = await get_all_clan_members()
            clan_tags = {member["tag"]: member["name"] for member in clan_members}

            #* PARAMÉTRAGE DE LA COMMANDE
            display_list = []

            for player in war_logs:
                tag = player.get("tag")
                fame = player.get("fame", 0)
                name = clan_tags.get(tag)

                if name:
                    display_list.append((name, fame))

            display_list.sort(key=lambda x: x[1], reverse=True)

            message = "⚔️ **Classement de la guerre en cours** ⚔️\n\n"

            for name, fame in display_list:
                message += f"▫️ {name} : {fame} points \n"

            await ctx.send(message)

        except Exception as e:
            await ctx.send(f"Une erreur est survenue : {e}")