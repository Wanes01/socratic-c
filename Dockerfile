FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# installs backend dependencies
COPY package*.json ./
RUN npm install

# intalls frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# copy all the ramaining code
COPY . .

# frontend build
RUN cd frontend && npm run build

# the port that will be used to expose the web app
EXPOSE 5000

CMD ["node", "index.js"]