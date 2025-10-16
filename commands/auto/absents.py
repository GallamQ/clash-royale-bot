
#! IMPORTS

from discord.ext import commands
from services.database import get_all_absences



#! COMMANDE "!ABSENTS"


#? PARAMÈTRAGE DE LA COMMANDE D'AFFICHAGE DE LA LISTE DES ABSENTS

class Absents(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.has_any_role("Chef de clan", "Adjoint", "Clash Bot")
    async def absents(self, ctx):
        await self.send_current_absences_list(ctx)

    #* CONSTRUCTION DU MESSAGE À AFFICHER
    async def send_current_absences_list(self, ctx):
        try:
            current_absences = await get_all_absences()

            if not current_absences:
                await ctx.send("📋 **Liste des absents :** Aucun absent actuellement !")
                return

            message = "📋 **Liste des absents actuels :**\n\n"

            pseudo_replacements = {"خير ان شاء الله": "Manel"}

            for absence in current_absences:
                name = pseudo_replacements.get(absence['name'], absence['name'])
                start_date = absence['start_date'].strftime('%d-%m-%Y')
                end_date = absence['end_date'].strftime('%d-%m-%Y')
                message += f"• **{name}** - Du {start_date} au {end_date}\n"

            await ctx.send(message)

        except Exception as e:
            await ctx.send(f"Erreur lors de la récupération des absences: {e}")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(Absents(bot))