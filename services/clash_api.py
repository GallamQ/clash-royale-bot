
#! IMPORTS

import os
import requests
import datetime
import asyncio
import functools
from dotenv import load_dotenv
from services.database import save_war_log, get_all_clan_tags, get_war_log



#! INITIALISATION DES VARIABLES D'ENVIRONNEMENT

load_dotenv()

API_KEY = os.getenv("API_KEY")
CLAN_TAG = os.getenv("CLAN_TAG")
BASE_URL = "https://api.clashroyale.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}



#! PROXIES

proxies_list = [
    {"http": "http://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10002", "https": "https://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10002"},
    {"http": "http://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10004", "https": "https://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10004"},
    {"http": "http://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10006", "https": "https://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10006"},
    {"http": "http://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10008", "https": "https://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10008"},
    {"http": "http://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10010", "https": "https://spk2ihoy6o:ympO0wyr9X32+gXRfj@isp.decodo.com:10010"}
]


#! FONCTION DE GESTION DES REQUÊTES API AVEC PROXIES

def fetch_with_proxies(endpoint):
    url = f"{BASE_URL}/{endpoint}"

    for proxy in proxies_list:
        try:
            response = requests.get(url, headers=HEADERS, proxies=proxy)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erreur avec le proxy {proxy} : {e}")
    print("Tous les proxies ont échoué !")
    return None



#! FONCTION DE RÉCUPÉRATION DES DONNÉES DE GUERRE

#? INITIALISATION DE LA COMMANDE

async def get_clan_war_data():
    endpoint = f"clans/%23{CLAN_TAG}/currentriverrace"
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, functools.partial(fetch_with_proxies, endpoint))



#! FONCTION DE RÉCUPÉRATION DES RÔLES DES MEMBRES DU CLAN

#? INITIALISATION DE LA COMMANDE

def get_clan_members():
    endpoint = f"clans/%23{CLAN_TAG}"
    data = fetch_with_proxies(endpoint)
    if data:
        return data.get("memberList", [])
    return []



#! FONCTION DE SAUVEGARDE DES DONNÉES DE GUERRE EN COURS

#? INITIALISATION DE LA FONCTION DE PRÉCISION DE LA SEMAINE EN COURS

def get_week_of_month(date):
    first_day_of_month = date.replace(day=1)
    adjusted_day = date.day + first_day_of_month.weekday()
    return (adjusted_day - 1) // 7 + 1


#? INITIALISATION DE LA FONCTION DE SAUVEGARDE DES DONNÉES DE LA GUERRE EN COURS

async def save_current_war_data():
    #* RÉCUPÉRATION DES DONNÉES DE GUERRE EN COURS
    endpoint = f"clans/%23{CLAN_TAG}/currentriverrace"
    war_data = fetch_with_proxies(endpoint)

    if not war_data:
        print("Impossible de récupérer les données de guerre via l'API !")
        return

    clan_data = war_data.get("clan", {})

    if not clan_data:
        print("Aucune donnée de clan trouvée !")
        return

    participants = clan_data.get("participants", [])

    if not participants:
        print("Aucun participant trouvé pour la guerre en cours !")
        return

    #* GESTION DES DONNÉES RÉCUPÉRÉES
    clan_tags = await get_all_clan_tags()
    participants_db = [
        {
            "tag": player.get("tag", "Inconnu"),
            "fame": player.get("fame", 0)
        }
        for player in participants if player["tag"] in clan_tags
    ]

    #* GESTION DE LA DATE
    war_date = datetime.datetime.now().date()

    #* GESTION DE L'ID DE LA GUERRE EN COURS
    today = war_date
    days_since_thursday = (today.weekday() - 3) % 7
    war_id = (today - datetime.timedelta(days=days_since_thursday)).strftime("%d-%m-%Y")

    #* GESTION DU RESET DES DONNÉES
    if len(participants_db) > 0:
        zero_count = sum(1 for p in participants_db if p["fame"] == 0)
        if zero_count / len(participants_db) > 0.9:
            print("Probable reset détecté, sauvegarde ignorée !")
            return

    old_log = await get_war_log(war_id) or []
    old_scores = {p["tag"]: p["fame"] for p in old_log}
    
    for p in participants_db:
        old_fame = old_scores.get(p["tag"], 0)
        p["fame"] = max(old_fame, p["fame"])

    #* SAUVEGARDE DES DONNÉES
    await save_war_log(war_id, war_date, participants_db)