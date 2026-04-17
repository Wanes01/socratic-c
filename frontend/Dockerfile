# stage 1: common dependencies
FROM node:20-bookworm-slim AS base
WORKDIR /app
COPY package*.json ./

# stage 2: development
FROM base AS development
RUN npm install
COPY . .
# exposes vite port and allows external connections with --host
CMD ["npm", "run", "dev", "--", "--host"]

# stage 3: build (compiles typescript into javascript)
FROM base AS build-step
RUN npm install
COPY . .
RUN npm run build

# stage 4: production (nginx) ---
FROM nginx:stable-alpine AS production
COPY --from=build-step /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]