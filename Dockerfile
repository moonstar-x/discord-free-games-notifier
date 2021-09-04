FROM node:12.20.0-alpine3.12

ARG DATE_CREATED
ARG VERSION

LABEL org.opencontainers.image.created=$DATE_CREATED
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.authors="moonstar-x"
LABEL org.opencontainers.image.vendor="moonstar-x"
LABEL org.opencontainers.image.title="Discord Free Games Notifier"
LABEL org.opencontainers.image.description="A Discord bot that will notify when free games on Steam or Epic Games come out."
LABEL org.opencontainers.image.source="https://github.com/moonstar-x/discord-free-games-notifier"

WORKDIR /opt/app

COPY package*.json ./

RUN npm ci --only=prod

COPY . .

CMD ["npm", "start"]
