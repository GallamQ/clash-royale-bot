
#! IMPORTS

import os
import json
import datetime
from services.clash_api import get_clan_members



#! SAUVEGARDE DES MEMBRES DU CLAN

#? INITIALISATION DES VARIABLES

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
CLAN_MEMBERS_FILE = os.path.join(DATA_DIR, "clan_members.json")

ROLE_TRANSLATION = {
    "member": "Membre",
    "elder": "Ancien",
    "coLeader": "Adjoint",
    "leader": "Chef de clan"
}

#? INITIALISATION DE LA FONCTION DE RÉCUPÉRATION DES DONNÉES DES MEMBRES DU CLAN

def update_clan_members():
    try:
        #* VÉRIFICATION DE L'EXISTENCE DU DOSSIER "DATA"
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)

        #* RÉCUPÉRATION DES DONNÉES DES MEMBRES DU CLAN VIA L'API
        try:
            members = get_clan_members()
        except Exception as e:
            print(f"Erreur lors de la récupération des données des membres du clan : {e} !")
            return
        
        #* RÉCUPÉRATION DES DONNÉES EXISTANTES DES MEMBRES DU CLAN
        if os.path.exists(CLAN_MEMBERS_FILE):
            with open(CLAN_MEMBERS_FILE, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                existing_members = {member["tag"]: member for member in existing_data["members"]}
        else:
            existing_members = {}

        #* PARAMÉTRAGE DE LA FONCTION
        clan_members = []
        for member in members:
            tag = member.get("tag", "Inconnu")
            name = member.get("name", "Inconnu")
            role = ROLE_TRANSLATION.get(member.get("role", "member"), "Inconnu")

            if tag in existing_members:
                join_date = existing_members[tag].get("join_date", datetime.datetime.now().strftime("%d-%m-%Y"))
            else:
                join_date = datetime.datetime.now().strftime("%d-%m-%Y")

            clan_members.append({
                "name": name,
                "tag": tag,
                "role": role,
                "join_date": join_date
            })

        data = {
            "last_updated": datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            "members": clan_members
        }

        #* SAUVEGARDE DES DONNÉES DANS LE FICHIER CLAN_MEMBERS.JSON
        with open(CLAN_MEMBERS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        print(f"Liste des membres mise à jour dans {CLAN_MEMBERS_FILE}")

        #* LOG DU CONTENU DU FICHIER CLAN_MEMBERS.JSON
        with open(CLAN_MEMBERS_FILE, "r", encoding="utf-8") as f:
            saved_data = json.load(f)
            print("Contenu du fichier clan_members.json après sauvegarde :")
            print(json.dumps(saved_data, indent=4, ensure_ascii=False))

    except Exception as e:
        print(f"Erreur lors de la mise à jour des membres du clan : {e}")