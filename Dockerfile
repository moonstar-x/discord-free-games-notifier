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

RUN apk add --no-cache git

WORKDIR /opt/app

COPY package*.json ./

RUN npm ci --only=prod

# These are added here as a way to define which env variables will be used.
ENV DISCORD_TOKEN ""
ENV PREFIX ""
ENV OWNER_ID ""
ENV INVITE_URL ""

COPY . .

VOLUME /opt/app/config /opt/app/data

CMD ["npm", "start"]
