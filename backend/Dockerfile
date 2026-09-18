FROM node:22-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend source
COPY . .

# Back4App (like most PaaS platforms) injects PORT at runtime.
# src/server.js already reads process.env.PORT, so no code change needed.
EXPOSE 5000

CMD ["npm", "start"]
