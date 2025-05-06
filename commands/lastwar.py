
#! IMPORTS !#

from discord.ext import commands
from services.clash_api import get_warlog



#! COMMANDE "!LASTWAR" !#

class LastWar(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        
    @commands.command()
    async def lastwar(self, ctx, n: int = 1):
        if n < 1:
            await ctx.send("Le paramètre doit être un nombre ! Exemple '!lastwar 1'.")
            return
        
        warlog = get_warlog()
        if not warlog:
            await ctx.send("Impossible de récupérer les données des guerres passées. Vérifiez l'API !")
            return
        
        if n > len(warlog):
            await ctx.send(f"Il n'y a pas assez de guerre dans l'historique du clan pour remonter au nombre de guerre souhaitée !")
            return
        
        war_data = warlog[n - 1]
        if war_data["state"] != "warEnded":
            await ctx.send(f"La guerre demande n'est pas terminée !")
            return
        
        clan_name = war_data["clan"]["name"]
        clan_score = war_data["clan"]["clanScore"]
        participants = war_data["participants"]
        
        participants = sorted(participants, key=lambda x: x.get("fame", 0), reverse=True)
        
        message = f"**Résultats de la guerre terminée il y {n} guerre(s) :**\n"
        message += f"Clan : {clan_name}\n"
        message += f"Score total : {clan_score}\n\n"
        message += "**Participants :**\n"

        for participant in participants:
            name = participant.get("name", "Inconnu")
            fame = participant.get("fame", 0)
            repair_points = participant.get("repairPoints", 0)
            message += f"- {name} : {fame} points de gloire, {repair_points} points de réparation\n"

        await ctx.send(message)


async def setup(bot):
    await bot.add_cog(LastWar(bot))