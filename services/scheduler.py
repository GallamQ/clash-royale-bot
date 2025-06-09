
#! IMPORT

import asyncio
from datetime import timedelta, datetime, time
from pytz import timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.clash_api import save_current_war_data, get_clan_war_data
from services.database import sync_clan_members, decrement_absences, get_all_clan_tags



#! INITIALISATION DU SCHEDULER

def initialize_scheduler(bot):
    paris_tz = timezone('Europe/Paris')
    scheduler = AsyncIOScheduler(timezone=paris_tz)


#? FONCTION DE PUBLICATION AUTOMATIQUE DU TOP 5

    async def publish_top5():
        channel = bot.get_channel(1361756327868629042)
        if channel:
            fake_message = await channel.send("Commande automatique : Top 5 !")
            ctx = await bot.get_context(fake_message)
            ctx.command = bot.get_command("top5")
            await bot.invoke(ctx)


#? FONCTION DE PUBLICATION AUTOMATIQUE DES MEMBRES À /KICK

    async def auto_kick():
        channel = bot.get_channel(1361756395510436162)
        if channel:
            fake_message = await channel.send("Commande automatique : Kick !")
            ctx = await bot.get_context(fake_message)
            ctx.command = bot.get_command("kick")
            await bot.invoke(ctx)


#? FONCTION DE SAUVEGARDE DES DONNÉES DE GUERRE

    async def save_war_data():
        print("Sauvegarde automatique des données de guerre en cours...")
        await save_current_war_data()
        print("Sauvegarde terminées !")


#? FONCTION DE SAUVEGARDE QUOTIDIENNE DES MEMBRES DU CLAN

    async def update_clan_members_task():
        print("Mise à jour quotidienne des membres du clan en cours...")
        await sync_clan_members()
        print("Mise à jour des membres terminée !")


#? FONCTION DE VEILLE DES DONNÉES DE FIN DE GUERRE

    async def war_watcher(start_time=None, end_time=None, interval=30):
        if start_time is None:
            start_time = time(11, 29)
        if end_time is None:
            end_time = time(11, 45)

        print(f"[Watcher] Démarrage de la veille des données de fin de guerre ({start_time} -> {end_time})")

        while True:
            now = datetime.datetime.now().time()

            if now >= end_time:
                print("[Watcher] Fin de la veille des données de fin de guerre !")
                break

            await save_current_war_data()

            war_data = await get_clan_war_data()
            participants = war_data.get("clan", {}).get("participants", [])
            clan_tags = await get_all_clan_tags()
            participants_db = [p for p in participants if p["tag"] in clan_tags]

            if participants_db and all(p.get("fame", 0) == 0 for p in participants_db):
                print("[Watcher] Reset détecté : arrêt de la veille des données de fin de guerre !")
                break

            await asyncio.sleep(interval)

#? WRAPPERS DES FONCTIONS

    #* COMMANDES AUTOMATIQUES

    #- WRAPPER TOP 5
    def publish_top5_wrapper():
        bot.loop.create_task(publish_top5())

    #- WRAPPER KICK
    def auto_kick_wrapper():
        bot.loop.create_task(auto_kick())

    #* SAUVEGARDES AUTOMATIQUES DE DONNÉES

    #- WRAPPER SAUVEGARDE DES DONNÉES DE GUERRE
    def save_war_data_wrapper():
        bot.loop.create_task(save_war_data())

    #- WRAPPER SAUVEGARDE DES MEMBRES DU CLAN
    def update_clan_members_wrapper():
        bot.loop.create_task(update_clan_members_task())

    #- WRAPPER DÉCRÉMENTATION DES ABSENCES
    def decrement_absences_wrapper():
        bot.loop.create_task(decrement_absences())

    #- WRAPPER VEILLE DES DONNÉES DE FIN DE GUERRE
    def war_watcher_wrapper():
        bot.loop.create_task(war_watcher())


#? PLANIFICATION DES FONCTIONS

    #* COMMANDES AUTOMATIQUES
    
    #- PUBLICATION DU TOP 5
    scheduler.add_job(publish_top5_wrapper, 'cron', day_of_week='mon', hour=12, minute=0)

    #- PUBLICATION DE LA LISTE DES MEMBRES À /KICK
    scheduler.add_job(auto_kick_wrapper, 'cron', day_of_week='mon', hour=12, minute=00)

    #* SAUVEGARDES AUTOMATIQUES DE DONNÉES
    
    #- SAUVEGARDE DES DONNÉES DE GUERRE
    scheduler.add_job(save_war_data_wrapper, 'cron', day_of_week= 'fri, sat, sun, mon', hour=11, minute=25)

    #- SAUVEGARDE DES MEMBRES DU CLAN
    scheduler.add_job(update_clan_members_wrapper, 'cron', hour=10, minute=0)

    #- DÉCRÉMENTATION DES ABSENCES
    scheduler.add_job(decrement_absences_wrapper, 'cron', day_of_week='mon', hour=14, minute=0)

    #- VEILLE DES DONNÉES DE FIN DE GUERRE
    scheduler.add_job(war_watcher_wrapper, 'cron', day_of_week='mon', hour=11, minute=29)

    #* TEST DE PLANIFICATION
    # run_time = datetime.now(paris_tz) + timedelta(minutes=1)
    # scheduler.add_job(save_war_data_wrapper, 'date', run_date=run_time)

    return scheduler