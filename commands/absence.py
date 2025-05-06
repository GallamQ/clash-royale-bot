
# ! IMPORTS ! #

from discord.ext import commands
import json
import os



# ! COMMANDE "!ABSENCE" ! #

ABSENCE_FILE = os.path.join(os.path.dirname(__file__), "../data/absences.json")
CLAN_MEMBERS_FILE = os.path.join(os.path.dirname(__file__), "../data/clan_members.json")

class Absence(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def absence(self, ctx, tag: str, wars: int):
        try:
            if os.path.exists(CLAN_MEMBERS_FILE):
                with open(CLAN_MEMBERS_FILE, "r", encoding="utf-8") as f:
                    clan_data = json.load(f)
                    clan_members = {member["tag"]: member for member in clan_data["members"]}
            else:
                await ctx.send("Le fichier clan_members.json est introuvable !")
                return

            if tag not in clan_members:
                await ctx.send(f"Aucun membre avec le tag `{tag}` trouvé dans le clan !")
                return

            member = clan_members[tag]
            name = member.get("name", "Inconnu")
            role = member.get("role", "Inconnu")
            
            if os.path.exists(ABSENCE_FILE):
                with open(ABSENCE_FILE, "r", encoding="utf-8") as f:
                    absences = json.load(f)
            else:
                absences = {}

            absences[tag] = {
                "name": name,
                "tag": tag,
                "role": role,
                "wars_left": wars
            }

            with open(ABSENCE_FILE, "w", encoding="utf-8") as f:
                json.dump(absences, f, indent=4, ensure_ascii=False)

            await ctx.send(f"Le joueur `{name}` a été marqué comme absent pour {wars} guerre(s).")

        except Exception as e:
            await ctx.send(f"Une erreur est survenue : {e}")



# ! AJOUT DE LA COMMANDE AU BOT ! #

async def setup(bot):
    await bot.add_cog(Absence(bot))