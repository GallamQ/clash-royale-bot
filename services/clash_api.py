
#! IMPORTS !#

import requests
import os
import json
from dotenv import load_dotenv
import datetime



#! INITIALISATION DES VARIABLES D'ENVIRONNEMENT !#

load_dotenv()

API_KEY = os.getenv("API_KEY")
CLAN_TAG = os.getenv("CLAN_TAG")
BASE_URL = "https://api.clashroyale.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}



#! FONCTIONS D'INTERACTION AVEC L'API CLASH ROYALE !#

#? FONCTION DE RÉCUPÉRATION DES DONNÉES DE GUERRE ?#

def get_clan_war_data():
    url = f"{BASE_URL}/clans/%23{CLAN_TAG}/currentriverrace"
    print(f"URL utilisée : {url}")
    print(f"Headers utilisés : {HEADERS}")
    print(f"Clé API utilisée : {API_KEY}")
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Erreur lors de la récupération des données de guerre : {response.status_code}")
        print(response.text)
        return None


#? FONCTION DE RÉCUPÉRATION DES RÔLES DES MEMBRES DU CLAN ?#

def get_clan_members():
    url = f"{BASE_URL}/clans/%23{CLAN_TAG}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json().get("memberList", [])
    else:
        print(f"Erreur lors de la récupération des membres du clan : {response.status_code}")
        print(response.text)
        return []


#? FONCTION DE RÉCUPÉRATION DE L'HISTORIQUE DES GUERRES DU CLAN ?#

def get_warlog():
    """Récupère l'historique des guerres de clan."""
    url = f"{BASE_URL}/clans/%23{CLAN_TAG}/warlog"  # %23 encode le caractère '#'
    response = requests.get(url, headers=HEADERS)
    print(f"Statut de la réponse : {response.status_code}")
    print(f"Contenu de la réponse : {response.text}")
    if response.status_code == 200:
        return response.json().get("items", [])
    else:
        print(f"Erreur lors de la récupération du warlog : {response.status_code}")
        return None


#? FONCTION DE SAUVEGARDE DES DONNÉES DE GUERRE EN COURS ?#

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WAR_LOG_FILE = os.path.join(BASE_DIR, "warlog_backup.json")

def get_week_of_month(date):
    first_day_of_month = date.replace(day=1)
    adjusted_day = date.day + first_day_of_month.weekday()
    return (adjusted_day - 1) // 7 + 1

def save_current_war_data():
    url = f"{BASE_URL}/clans/%23{CLAN_TAG}/currentriverrace"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code == 200:
        war_data = response.json()

        clan_data = war_data.get("clan", {})
        if not clan_data:
            print("Aucune donnée de clan trouvée dans la réponse !")
            return
        
        participants = clan_data.get("participants", [])
        if not participants:
            print("Aucune participant trouvé pour la guerre en cours !")
            return
        
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
        
        MONTHS_FR = {
            "January": "Janvier", "February": "Février", "March": "Mars",
            "April": "Avril", "May": "Mai", "June": "Juin",
            "July": "Juillet", "August": "Août", "September": "Septembre",
            "October": "Octobre", "November": "Novembre", "December": "Décembre"
        }
        
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
        print(f"Erreur lors de la récupération des données de guerre : {response.status_code}")
        print(response.text)
