# stage 1: common dependencies
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./

# stage 2: development
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# stage 3: build (compiles typescript into javascript)
FROM base AS build-step
RUN npm install
COPY . .
RUN npm run build

# stage 4: production (minifies the image size)
FROM node:20-bookworm-slim AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && rm -rf /root/.npm
# copies the code compiled from the previews stage
COPY --from=build-step /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]