
#! IMPORTS

import datetime
from discord.ext import commands
from services.clash_api import get_clan_war_data



#! COMMANDE "!WAR"

class War(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def war(self, ctx):

#? GESTION DE LA PÉRIODE D'UTILISATION DE LA COMMANDE

        now = datetime.datetime.now()
        
        start_of_war = now.replace(hour=11, minute=40, second=0, microsecond=0) - datetime.timedelta(days=(now.weekday() - 3) % 7)
        end_of_war = now.replace(hour=11, minute=40, second=0, microsecond=0) + datetime.timedelta(days=(7 - now.weekday() + 0) % 7)

        if start_of_war <= now <= end_of_war:
            war_data = get_clan_war_data()

            if not war_data:
                await ctx.send("Impossible de récupérer les données de la guerre en cours !")
                return

#? PARAMÉTRAGE DE LA COMMANDE
            participants = war_data.get("clan", {}).get("participants", [])
            
            message = f":crossed_swords: **Résultats de la guerre en cours** :crossed_swords:\n\n "
            message += "**Participants :**\n"
            for participant in participants:
                name = participant.get("name", "Inconnu")
                fame = participant.get("fame", 0)
                message += f"- {name} : {fame} points\n"

            await ctx.send(message)
        else:
            await ctx.send("La guerre n'est pas en cours. Elle a lieu du jeudi au lundi !")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(War(bot))