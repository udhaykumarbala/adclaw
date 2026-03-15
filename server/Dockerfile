# Multi-stage build

# === Build stage ===
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# === Production stage ===
FROM node:20-slim
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY public/ ./public/
RUN mkdir -p /app/data /app/public/sites /app/public/events

USER node
EXPOSE 3402
CMD ["node", "dist/index.js"]
