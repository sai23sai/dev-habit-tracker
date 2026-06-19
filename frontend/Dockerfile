FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching.
COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite dev server, bound to all interfaces so docker-compose can reach it.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
