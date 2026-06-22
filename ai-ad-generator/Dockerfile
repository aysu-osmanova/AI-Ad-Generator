# syntax=docker/dockerfile:1

# ---- Build stage: install full deps and build the Vite frontend ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies against the lockfile. npm resolves the correct
# platform-specific binaries (rolldown/esbuild) for this Linux image,
# regardless of the OS the lockfile was generated on.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage: production-only deps + built assets ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Express server + the static client it serves
COPY server ./server
COPY public ./public
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "server/index.js"]
