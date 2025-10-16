
#! IMPORTS

import datetime
from discord.ext import commands
from services.database import add_absence, get_clan_member_by_tag, remove_absence, get_all_absences



#! COMMANDE "!ABSENCE"


#? PARAMÈTRAGE DE LA COMMANDE DE GESTION DES ABSENCES (AJOUT | DÉTAILS | RETRAIT)

class Absence(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def absence(self, ctx, tag: str, start: str = None, end: str = None):
        try:

            #* VÉRIFICATION DE L'EXISTENCE DU MEMBRE DANS LE CLAN
            member = await get_clan_member_by_tag(tag)
            if not member:
                await ctx.send(f"Aucun membre avec le tag `{tag}` trouvé dans le clan !")
                return

            #* SUPPRESION D'UNE ABSENCE
            if start and start.lower() == "remove":
                await remove_absence(tag)
                await ctx.send(f"Toutes les absences du joueur `{member['name']}` ont été supprimées !")

                #- AFFICHAGE DE LA LISTE DES ABSENTS APRÈS MISE À JOUR
                await self.send_current_absences_list(ctx)
                return

            #* GESTION DES DATES
            if not start or not end:
                today = datetime.date.today()
                start_date = today - datetime.timedelta(days=today.weekday())
                end_date = start_date + datetime.timedelta(days=6)
            else:
                start_date = datetime.datetime.strptime(start, "%d-%m-%Y").date()
                end_date = datetime.datetime.strptime(end, "%d-%m-%Y").date()

            await add_absence(tag, start_date, end_date)

            #- MESSAGE DE CONFIRMATION
            confirmation_msg = f"Le joueur `{member['name']}` a été marqué absent du {start_date.strftime('%d-%m-%Y')} au {end_date.strftime('%d-%m-%Y')}."

            await ctx.send(confirmation_msg)

            #- AFFICHAGE DE LA LISTE DES ABSENTS APRÈS MISE À JOUR
            await self.send_current_absences_list(ctx)

        except Exception as e:
            await ctx.send(f"Une erreur est survenue : {e}")


#? PARAMÈTRAGE DE LA COMMANDE D'AFFICHAGE DE LA LISTE DES ABSENTS

    @commands.command()
    @commands.has_any_role("Chef de clan", "Adjoint", "Clash Bot")

    
    #* AFFICHAGE DE LA LISTE DES ABSENTS
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
    await bot.add_cog(Absence(bot))