# Utilise une image Python officielle
FROM python:3.12-slim

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY requirements.txt .

# Met à jour pip et installe les dépendances (dont setuptools)
RUN pip install --upgrade pip setuptools && pip install -r requirements.txt

# Copie le reste du code
COPY . .

# Commande de lancement du bot
CMD ["python", "bot.py"]