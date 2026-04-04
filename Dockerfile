# frontend build
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# backend setup
FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# copy the built frontend
COPY --from=frontend-builder /app/frontend/dist ./public
EXPOSE 5000
CMD ["node", "index.js"]