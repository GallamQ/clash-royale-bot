
#! IMPORTS

from discord.ext import commands
from services.database import get_latest_war_logs, get_all_clan_members



#! COMMANDE "!TOP5"

#? INITIALISATION DE LA COMMANDE

class Top5(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.has_any_role("Chef de clan", "Adjoint", "Clash Bot")
    async def top5(self, ctx):
        try:
            #* RÉCUPÉRATION DES DONNÉES DE LA DERNIÈRE GUERRE DE CLAN
            war_logs = await get_latest_war_logs()

            if not war_logs:
                await ctx.send("Aucune donnée de guerre trouvée !")
                return

            #* RÉCUPÉRATION DES MEMBRES POUR LES RÔLES
            clan_members = await get_all_clan_members()
            clan_members_dict = {member["tag"]: member for member in clan_members}

            #* PARAMÉTRAGE DE LA COMMANDE
            sorted_participants = sorted(war_logs, key=lambda x: x.get("fame", 0), reverse=True)
            top_5 = sorted_participants[:5]

            pseudo_replacements = {"خير ان شاء الله": "Manel"}

            role_translation = {
                "member": "Membre",
                "elder": "Ancien",
                "coLeader": "Adjoint",
                "leader": "Chef de clan"
            }

            war_id = war_logs[0]["war_id"]
            message = f":crossed_swords:   **Top 5 de la semaine**   :date:   {war_id}   :crossed_swords:\n\n"
            medals = [":first_place:", ":second_place:", ":third_place:", ":medal:", ":medal:"]
            for i, player in enumerate(top_5):
                tag = player.get("tag")
                name = clan_members_dict.get(tag, {}).get("name", "Inconn")
                fame = player.get("fame", 0)
                role = clan_members_dict.get(tag, {}).get("role", "member")
                role_name = role_translation.get(role, "Inconnu")

                if name in pseudo_replacements:
                    name = pseudo_replacements[name]

                promote_note = " :white_small_square: **Promotion :exclamation:**" if role == "member" else ""

                message += f"{medals[i]} {name} :white_small_square: {fame} points :white_small_square: {role_name}{promote_note}\n\n"

            await ctx.send(message)

        except Exception as e:
            await ctx.send(f"Une erreur est survenue : {e}")


#? GESTION DES ERREURS POUR "!TOP5"

    @top5.error
    async def top5_error(ctx, error):
        if isinstance(error, commands.MissingAnyRole):
            await ctx.send("Désolé, vous n'avez pas le rôle nécessaire pour utiliser cette commande !")
        else:
            print(f"Erreur inconnue : {error}")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(Top5(bot))