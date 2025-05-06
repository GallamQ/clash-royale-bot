
#! IMPORT !#
from discord.ext import commands



#! COMMANDE TEST "!PING" !#

class Ping(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def ping(self, ctx):
        await ctx.send("Pong!")



#! AJOUT DE LA COMMANDE AU BOT !#

async def setup(bot):
    await bot.add_cog(Ping(bot))