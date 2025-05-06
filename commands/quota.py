
#! IMPORT !#

from discord.ext import commands
from services.clash_api import get_clan_war_data, get_clan_members



#! COMMANDE "!QUOTA" !#

class Quota(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @commands.command()
    @commands.has_any_role("Chef de clan", "Adjoint", "Clash Bot")
    async def quota(self, ctx):
        
        #? RÉCUPERATION DES DONNÉES DE GUERRE ?#
        
        war_data = get_clan_war_data()
        if not war_data:
            await ctx.send("Impossible de récupérer les données de la dernières guerre de clan ! Vérifiez l'API.")
            return
        
        
        #? RÉCUPÉRATION DES MEMBRES DU CLAN ET LEURS RÔLES ?#
        
        clan_members = get_clan_members()
        roles_by_name = {member["name"]: member["role"] for member in clan_members}
        
        
        #? EXTRACTION DES JOUEURS N'AYANT PAS ATTEINT LE QUOTA ?#
        
        participants = war_data.get("clan", {}).get("participants", [])
        if not participants:
            await ctx.send(f"Aucun participant trouvé pour la dernière guerre de clan !")
            return
        
        
        #? FILTRAGE DES JOUEURS N'AYANT PAS ATTEINT LE QUOTA ?#
        
        quota = 1600
        below_quota = [
            {
                "name": player.get("name", "Inconnu"),
                "fame": player.get("fame", 0),
                "role": roles_by_name.get(player["name"], "Member")
            }
            for player in participants if player.get("fame", 0) < quota
        ]
        
        
        #? TRI DES JOUEURS PAR POINTS DÉCROISSANTS ?#
        
        below_quota = sorted(below_quota, key=lambda x: x["fame"], reverse=True)
        
        
        #? CONSTRUCTION DU MESSAGE ?#
        
        if not below_quota:
            await ctx.send(f"Tous les joueurs ont atteint le quota de {quota} points ! 🎉")
            return
        
        message = f"**Joueurs n'ayant pas atteint le quota de {quota} points :**\n"
        role_translation = {
            "member": "Membre",
            "elder": "Ancien",
            "coLeader": "Adjoint",
            "leader": "Chef de clan"
        }

        #* GESTION DES EXCEPTIONS DE PSEUDO *#
        
        pseudo_replacements = {"خير ان شاء الله": "Manel"}
        
        #* -------------------------------- *#
        
        for player in below_quota:
            name = player["name"]
            fame = player["fame"]
            role = role_translation.get(player["role"], "Inconnu")
            
            if name in pseudo_replacements:
                name = pseudo_replacements[name]
                
            message+= f"- {name} : {fame} points ({role})\n"
            
        await ctx.send(message)


    #* GESTION DES ERREURS POUR "!QUOTA" *#

    @quota.error
    async def quota_error(ctx, error):
        if isinstance(error, commands.MissingAnyRole):
            await ctx.send("Désolé, vous n'avez pas le rôle nécessaire pour utiliser cette commande !")
        else:
            print(f"Erreur inconnue : {error}")

#! AJOUT DE LA COMMANDE AU BOT !#

async def setup(bot):
    await bot.add_cog(Quota(bot))