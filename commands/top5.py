
#! IMPORTS !#

from discord.ext import commands
import os
import json



#! COMMANDE "!TOP5" !#

WAR_LOG_FILE = os.path.join(os.path.dirname(__file__), "../services/warlog_backup.json")

class Top5(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.has_any_role("Chef de clan", "Adjoint", "Clash Bot")
    async def top5(self, ctx):
        
        try:
            with open (WAR_LOG_FILE, "r", encoding="utf-8") as f:
                war_data = json.load(f)

            latest_war = war_data[0]
            participants = latest_war["clan"]["participants"]
            
            if not participants:
                await ctx.send("Aucun participant trouvé pour la dernière guerre de clan !")
                return

            sorted_participants = sorted(participants, key=lambda x: x.get("game", 0), reverse=True)
            top_5 = sorted_participants[:5]

            pseudo_replacements = {"خير ان شاء الله": "Manel"}
            
            role_translation = {
                "member": "Membre",
                "elder": "Ancien",
                "coLeader": "Adjoint",
                "leader": "Chef de clan"
            }

            date = latest_war["date"]
            week_label, month_year = date.split(" semaine de ")
            
            message = f":crossed_swords:   **Top 5 de la semaine**   :date:   {month_year}   |   {week_label} semaine   :crossed_swords:\n\n"
            medals = [":first_place:", ":second_place:", ":third_place:", ":medal:", ":medal:"]
            for i, player in enumerate(top_5):
                name = player.get("name", "Inconnu")
                fame = player.get("fame", 0)
                role = player.get("role", "member")
                role_name = role_translation.get(role, "Inconnu")

                if name in pseudo_replacements:
                    name = pseudo_replacements[name]

                promote_note = " :white_small_square: **Promotion :exclamation:**" if role == "member" else ""
                
                message += f"{medals[i]} {name} :white_small_square: {fame} points :white_small_square: {role_name}{promote_note}\n\n"

            await ctx.send(message)

        except FileNotFoundError:
            await ctx.send("Le fichier `warlog_backup.json` est introuvable ! Aucune donnée de guerre n'a été sauvegardée.")
        except Exception as e:
            await ctx.send(f"Une erreur est survenue : {e}")


    #* GESTION DES ERREURS POUR "!TOP5" *#

    @top5.error
    async def top5_error(ctx, error):
        if isinstance(error, commands.MissingAnyRole):
            await ctx.send("Désolé, vous n'avez pas le rôle nécessaire pour utiliser cette commande !")
        else:
            print(f"Erreur inconnue : {error}")

#! AJOUT DE LA COMMANDE AU BOT !#

async def setup(bot):
    await bot.add_cog(Top5(bot))