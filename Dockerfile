FROM nginx:alpine

# 1. Aufräumen: Lösche die Standard "Welcome to Nginx" Seite
RUN rm -rf /usr/share/nginx/html/*

# 2. Kopieren: Nimm den INHALT von src/ und packe ihn ins Root
# Wichtig: Das 'src/' mit dem Slash am Ende sorgt dafür, dass nur der Inhalt kopiert wird
COPY src/ /usr/share/nginx/html/

# 3. Port freigeben
EXPOSE 80