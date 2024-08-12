# Base alias to use across stages.
FROM node:20.12.2-alpine AS base

# Dependency stage.
FROM base AS deps

WORKDIR /tmp/app

COPY package*.json ./

RUN npm ci

# Build stage.
FROM base AS build

WORKDIR /tmp/app

COPY --from=deps /tmp/app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image.
FROM base AS runner

WORKDIR /opt/app
ENV NODE_END=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=build --chown=nodejs:nodejs /tmp/app .

USER nodejs

CMD ["npm", "start"]
