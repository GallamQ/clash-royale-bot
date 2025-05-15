
#! IMPORTS

import os
import asyncpg
import datetime
from services.clash_api import get_clan_members



#! INITIALISATION DE LA BASE DE DONNÉES

#? INITIALISATION DES VARIABLES

DATABASE_URL = os.getenv("DATABASE_URL")


#? CONNEXION À LA BASE DE DONNÉES

async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)


#? SAUVEGARDE DES MEMBRES DU CLAN

async def sync_clan_members():
    #* RÉCUPÉRATION DES DONNÉES DES MEMBRES DU CLAN
    api_members = get_clan_members()
    api_tags = {m["tag"] for m in api_members}
    conn = await get_db_connection()

    #* RÉCUPÉRATION DES TAGS ET JOIN_DATES DÉJÀ PRÉSENTS DANS LA DB
    rows = await conn.fetch("SELECT tag, join_date FROM clan_members;")
    db_info = {row["tag"]: row["join_date"] for row in rows}

    #* AJOUT OU MÀJ DES MEMBRES DU CLAN
    for member in api_members:
        tag = member["tag"]
        join_date = db_info.get(tag) or datetime.date.today()

        await conn.execute("""
            INSERT INTO clan_members (tag, name, role, join_date)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (tag) DO UPDATE
            SET name = EXCLUDED.name, role = EXCLUDED.role;
        """, tag, member["name"], member["role"], join_date)

    #* SUPPRESSION DES MEMBRES QUI NE SONT PLUS DANS LE CLAN
    tags_to_remove = set(db_info.keys()) - api_tags

    if tags_to_remove:
        await conn.execute(
            "DELETE FROM clan_members WHERE tag = ANY($1::varchar[]);",
            list(tags_to_remove)
        )

    await conn.close()


#? RÉCUPÉRATION DES MEMBRES DU CLAN PAR TAG

async def get_clan_member_by_tag(tag):
    conn = await get_db_connection()
    row = await conn.fetchrow("SELECT * FROM clan_members WHERE tag = $1;", tag)
    await conn.close()
    return dict(row) if row else None


#? AJOUT DES ABSENCES

async def add_absence(tag, start_date, end_date):
    conn = await get_db_connection()
    await conn.execute(
        "INSERT INTO absences (tag, start_date, end_date) VALUES ($1, $2, $3);",
        tag, start_date, end_date
    )
    await conn.close()


#? RETRAIT DES ABSENCES

async def remove_absence(tag):
    conn = await get_db_connection()
    await conn.execute("DELETE FROM absences WHERE tag = $1;", tag)
    await conn.close()


#? DÉCRÉMENTATION DES ABSENCES

async def decrement_absences():
    conn = await get_db_connection()
    today = datetime.date.today()
    await conn.execute(
        "DELETE FROM absences WHERE end_date < $1;", today
    )
    await conn.close()
    print("Absences expirées supprimées avec succès !")


#? SAUVEGARDE DES RÉSULTATS DE GUERRE DE CLAN

async def save_war_log(war_date, participants):
    conn = await get_db_connection()

    for player in participants:
        await conn.execute(
            """
            INSERT INTO war_logs (war_date, tag, fame)
            VALUES ($1, $2, $3)
            """,
            war_date, player["tag"], player["fame"]
        )
    await conn.close()