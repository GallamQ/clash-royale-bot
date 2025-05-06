
#! IMPORTS !#

import discord
from discord.ext import commands
from dotenv import load_dotenv
import os
from services.scheduler import initialize_scheduler
import asyncio



#! INITIALISATION DU BOT !#

#? CHARGEMENT DES VARIABLES D'ENVIRONNEMENT ?#

load_dotenv()

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")


#? PARAMÉTRAGE DU BOT ?#

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)


#? INITIALISATION DU SCHEDULER ?#

bot.scheduler = initialize_scheduler(bot)


#? ACTIVATION DU BOT ?#

@bot.event
async def on_ready():
    print(f"Bot connecté en tant que {bot.user}")
    if not hasattr(bot, "scheduler_started"):
        bot.scheduler.start()
        bot.scheduler_started = True
        print("Scheduler démarré !")


#? CHARGEMENT DES COMMANDES ?#

async def load_extensions():
    await bot.load_extension("commands.ping")
    await bot.load_extension("commands.top5")
    # await bot.load_extension("commands.quota")
    # await bot.load_extension("commands.lastwar")
    await bot.load_extension("commands.kick")
    await bot.load_extension("events.welcome")
    await bot.load_extension("commands.absence")
    
async def main():
    async with bot:
        await load_extensions()
        await bot.start(DISCORD_TOKEN)
        
asyncio.run(main())