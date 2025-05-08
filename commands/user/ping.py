
#! IMPORT

from discord.ext import commands



#! COMMANDE TEST "!PING"

#? INITIALISATION DE LA COMMANDE

class Ping(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.has_any_role("Chef de clan", "Adjoint", "Clash Bot")
    async def ping(self, ctx):
        await ctx.send("Pong!")



#! AJOUT DE LA COMMANDE AU BOT

async def setup(bot):
    await bot.add_cog(Ping(bot))