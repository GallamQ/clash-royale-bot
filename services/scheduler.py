
#! IMPORT !#

from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import os
import json
from datetime import datetime, timedelta
from discord.ext.commands import Context
from services.clash_api import save_current_war_data
from services.clan_members import update_clan_members



#! INITIALISATION DU SCHEDULER !#

def initialize_scheduler(bot):
    scheduler = AsyncIOScheduler()

    #? FONCTION DE PUBLICATION AUTOMATIQUE DU TOP 5 ?#

    async def publish_top5():
        channel = bot.get_channel(1361756327868629042)
        if channel:
            fake_message = await channel.send("Commande automatique : Top 5 !")
            ctx = await bot.get_context(fake_message)
            ctx.command = bot.get_command("top5")
            await bot.invoke(ctx)
            
        
        
    #? FONCTION DE PUBLICATION AUTOMATIQUE DU QUOTA ?#
    
    async def publish_quota():
        channel = bot.get_channel(1361756395510436162)
        if channel:
            fake_message = await channel.send("Commande automatique : Quota !")
            ctx = await bot.get_context(fake_message)
            print(f"Contexte généré : {ctx}")
            ctx.command = bot.get_command("quota")
            print(f"Commande associée : {ctx.command}")
            await bot.invoke(ctx)
    
    
    #? FONCTION DE PUBLICATION AUTOMATIQUE DES MEMBRES À KICK ?#
    
    async def auto_kick():
        channel = bot.get_channel(1361756395510436162)
        if channel:
            fake_message = await channel.send("Commande automatique : Kick !")
            ctx = await bot.get_context(fake_message)
            ctx.command = bot.get_command("kick")
            await bot.invoke(ctx)


    #? SAUVEGARDE DES DONNÉES DE GUERRE ?#
    
    async def save_war_data():
        print("Sauvegarde automatique des données de guerre en cours...")
        save_current_war_data()
        print("Sauvegarde terminées !")
    
    #? SAUVEGARDE QUOTIDIENNE DES MEMBRES DU CLAN ?#
    
    async def update_clan_members_task():
        print("Mise à jour quotidienne des membres du clan en cours...")
        update_clan_members()
        print("Mise à jour des membres terminée !")


    #? DÉCRÉMENTATION DES ABSENCES ?#
    
    ABSENCE_FILE = os.path.join(os.path.dirname(__file__), "../data/absences.json")
    
    async def decrement_absences():
        try:
            if os.path.exists(ABSENCE_FILE):
                with open(ABSENCE_FILE, "r", encoding="utf-8") as f:
                    absences = json.load(f)
            else:
                absences = {}

            updated_absences = {}
            for tag, info in absences.items():
                if info["wars_left"] > 1:
                    info["wars_left"] -= 1
                    updated_absences[tag] = info
                else:
                    print(f"Le joueur {info['name']} n'est plus marqué comme absent !")

            with open(ABSENCE_FILE, "w", encoding="utf-8") as f:
                json.dump(updated_absences, f, indent=4, ensure_ascii=False)

            print("Absences décrémentées avec succès !")

        except Exception as e:
            print(f"Erreur lors de la décrémentation des absences : {e}")
        
        
    def publish_top5_wrapper():
        bot.loop.create_task(publish_top5())
        
    def publish_quota_wrapper():
        bot.loop.create_task(publish_quota())
        
    def save_war_data_wrapper():
        bot.loop.create_task(save_war_data())
        
    def auto_kick_wrapper():
        bot.loop.create_task(auto_kick())

    def update_clan_members_wrapper():
        bot.loop.create_task(update_clan_members_task())

    def decrement_absences_wrapper():
        bot.loop.create_task(decrement_absences())


    #? PLANIFICATION DU MESSAGE POUR LES FINS DE JOURS DE GUERRE ?#

    scheduler.add_job(publish_top5_wrapper, 'cron', day_of_week='fri, sat, sun, mon', hour=12, minute=0)
    
    # scheduler.add_job(publish_quota_wrapper, 'cron', day_of_week='mon', hour=12, minute=0)
    
    scheduler.add_job(save_war_data_wrapper, 'cron', day_of_week= 'mon', hour=11, minute=38)
    
    scheduler.add_job(auto_kick_wrapper, 'cron', day_of_week='mon', hour=12, minute=00)
    
    scheduler.add_job(update_clan_members_wrapper, 'cron', hour=10, minute=0)
    
    scheduler.add_job(decrement_absences_wrapper, 'cron', day_of_week='mon', hour=14, minute=0)


    # scheduler.add_job(save_war_data_wrapper, 'date', run_date=datetime.now() + timedelta(minutes=1))
    # Planification pour tester dans une minute
    # scheduler.add_job(decrement_absences_wrapper, 'date', run_date=datetime.now() + timedelta(minutes=1))

    return scheduler