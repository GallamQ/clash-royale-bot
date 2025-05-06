
# ! IMPORTS ! #

from discord.ext import commands
import discord



# ! ÉVÉNEMENT "WELCOME" ! #

class Welcome(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member):
        welcome_channel_id = 1361752094067134675
        welcome_channel = member.guild.get_channel(welcome_channel_id)

        if welcome_channel:
            message = (
                f"Bienvenue sur le serveur, {member.mention} ! 🎉\n"
                "Pense à utiliser le même pseudo que sur Clash Royale ! Et que les guerres te soient favorables 🙏⚔️"
            )
            await welcome_channel.send(message)



#! AJOUT DE L'ÉVÉNEMENT AU BOT !#

async def setup(bot):
    await bot.add_cog(Welcome(bot))