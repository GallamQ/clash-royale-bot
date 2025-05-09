
#! IMPORTS

import os
import json
import requests
import datetime
from dotenv import load_dotenv



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

def get_clan_war_data():
    endpoint = f"clans/%23{CLAN_TAG}/currentriverrace"
    return fetch_with_proxies(endpoint)



#! FONCTION DE RÉCUPÉRATION DES RÔLES DES MEMBRES DU CLAN

#? INITIALISATION DE LA COMMANDE

def get_clan_members():
    endpoint = f"clans/%23{CLAN_TAG}"
    data = fetch_with_proxies(endpoint)
    if data:
        return data.get("memberList", [])
    return []



#! FONCTION DE SAUVEGARDE DES DONNÉES DE GUERRE EN COURS

#? INITIALISATION DES VARIABLES

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WAR_LOG_FILE = os.path.join(BASE_DIR, "warlog_backup.json")

MONTHS_FR = {
    "January": "Janvier", "February": "Février", "March": "Mars",
    "April": "Avril", "May": "Mai", "June": "Juin",
    "July": "Juillet", "August": "Août", "September": "Septembre",
    "October": "Octobre", "November": "Novembre", "December": "Décembre"
}


#? INITIALISATION DE LA FONCTION DE PRÉCISION DE LA SEMAINE EN COURS

def get_week_of_month(date):
    first_day_of_month = date.replace(day=1)
    adjusted_day = date.day + first_day_of_month.weekday()
    return (adjusted_day - 1) // 7 + 1

#? INITIALISATION DE LA FONCTION DE SAUVEGARDE DES DONNÉES DE LA GUERRE EN COURS

def save_current_war_data():
    #* RÉCUPÉRATION DES DONNÉES DES MEMBRES DU CLAN PARTICIPANT À LA GUERRE EN COURS
    endpoint = f"clans/%23{CLAN_TAG}/currentriverrace"
    war_data = fetch_with_proxies(endpoint)

    if war_data:
        clan_data = war_data.get("clan", {})

        if not clan_data:
            print("Aucune donnée de clan trouvée dans la réponse !")
            return

        participants = clan_data.get("participants", [])

        if not participants:
            print("Aucun participant trouvé pour la guerre en cours !")
            return

        #* PARAMÉTRAGE DE LA FONCTION
        current_members = get_clan_members()
        member_roles = {member["tag"]: member["role"] for member in current_members}

        participants = [
            {
                "name": player.get("name", "Inconnu"),
                "tag": player.get("tag", "Inconnu"),
                "fame": player.get("fame", 0),
                "role": member_roles.get(player.get("tag", "Inconnu"), "member")
            }
            for player in participants
        ]

        current_date = datetime.datetime.now()
        month_english = current_date.strftime("%B")
        month_french = MONTHS_FR.get(month_english, month_english)
        formatted_date = f"{month_french} {current_date.strftime("%Y")}"

        week_of_month = get_week_of_month(current_date)
        week_names = ["Première", "Deuxième", "Troisième", "Quatrième", "Cinquième"]
        week_label = week_names[week_of_month - 1] if week_of_month <= len(week_names) else f"{week_of_month}ème"

        participants = sorted(participants, key=lambda x: x.get("fame", 0), reverse=True)

        war_entry = {
            "date": f"{week_label} semaine de {formatted_date}",
            "clan": {
                "name": clan_data.get("name", "Inconnu"),
                "tag": clan_data.get("tag", "Inconnu"),
                "fame": clan_data.get("fame", 0),
                "participants": participants
            },
        }

        try:
            if os.path.exists(WAR_LOG_FILE):
                with open(WAR_LOG_FILE, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
            else:
                existing_data = []

            existing_data.insert(0, war_entry)

            with open(WAR_LOG_FILE, "w", encoding="utf-8") as f:
                json.dump(existing_data, f, indent=4, ensure_ascii=False)
            print(f"Données sauvegardées dans {WAR_LOG_FILE}")

        except IOError as e:
            print(f"Erreur lors de la création du fichier {WAR_LOG_FILE} : {e}")

        except Exception as e:
            print(f"Erreur inattendue lors de la sauvegarde des données : {e}")

    else:
        print("Impossible de récupérer les données de guerre via l'API !")