
#! IMPORTS

import datetime
from discord.ext import commands
from services.database import add_absence, get_clan_member_by_tag, remove_absence



#! COMMANDE "!ABSENCE"

#? INITIALISATION DE LA COMMANDE

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
            await ctx.send(f"Le joueur `{member['name']}` a été marqué absent du {start_date.strftime('%d-%m-%Y')} au {end_date.strftime('%d-%m-%Y')}.")

        except Exception as e:
            await ctx.send(f"Une erreur est survenue : {e}")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(Absence(bot))