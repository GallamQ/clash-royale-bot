# Utilise une image Python officielle
FROM python:3.12-slim

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY requirements.txt .

# Met à jour pip et setuptools, puis installe les dépendances
RUN pip install --upgrade pip setuptools && pip install -r requirements.txt

# Affiche les versions de pip et setuptools pour debug
RUN pip --version && pip show setuptools

# Vérifie que pkg_resources est bien importable
RUN python -c "import pkg_resources"

# Copie le reste du code
COPY . .

# Commande de lancement du bot
CMD ["python", "bot.py"]