
#! IMPORTS

import datetime
from pytz import timezone
from discord.ext import commands
from services.clash_api import get_clan_war_data
from services.database import get_all_clan_tags



#! COMMANDE "!WAR"

class War(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def war(self, ctx):
        try:
#? GESTION DE LA PÉRIODE D'UTILISATION DE LA COMMANDE

            paris_tz = timezone("Europe/Paris")
            now = datetime.datetime.now(paris_tz)

            weekday = now.weekday()
            days_since_thursday = (weekday - 3) % 7
            start_of_war = (now - datetime.timedelta(days=days_since_thursday)).replace(hour=11, minute=40, second=0, microsecond=0)
            end_of_war = (start_of_war + datetime.timedelta(days=4)).replace(hour=11, minute=40, second=0, microsecond=0)

            if start_of_war <= now <= end_of_war:
                war_data = await get_clan_war_data()
                print("DEBUT war_data:", war_data)

                if not war_data:
                    await ctx.send("Impossible de récupérer les données de la guerre en cours !")
                    return

#? PARAMÉTRAGE DE LA COMMANDE
                participants = war_data.get("clan", {}).get("participants", [])

                if not participants:
                    await ctx.send("Aucun participant trouvé pour la guerre en cours.")
                    return

                current_tags = await get_all_clan_tags()

                filtered_participants = sorted(
                    [p for p in participants if p.get("tag") in current_tags],
                    key=lambda p: p.get("fame", 0),
                    reverse=True
                )

                pseudo_replacements = {"خير ان شاء الله": "Manel"}

                message = f"⚔️ **Résultats de la guerre en cours** ⚔️\n\n"
                for participant in filtered_participants:
                    name = participant.get("name", "Inconnu")
                    fame = participant.get("fame", 0)
                    name = pseudo_replacements.get(name, name)
                    message += f"{name} ▫️ {fame} points\n"

                if len(message) > 2000:
                    for i in range(0, len(message), 2000):
                        await ctx.send(message[i:i+2000])
                else:
                    await ctx.send(message)
            else:
                await ctx.send("La guerre n'est pas en cours. Elle a lieu du jeudi au lundi !")

        except Exception as e:
            print(f"Erreur dans la commande war: {e}")
            await ctx.send("Une erreur est survenue lors de l'exécution de la commande '!war' !")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(War(bot))