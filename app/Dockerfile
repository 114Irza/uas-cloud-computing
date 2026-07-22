# --- Base image ---
FROM node:20-alpine

# --- Install curl (dipakai untuk HEALTHCHECK) ---
RUN apk add --no-cache curl

# --- Working directory di dalam container ---
WORKDIR /usr/src/app

# --- Install dependency terlebih dahulu (memanfaatkan Docker layer cache) ---
COPY package*.json ./
RUN npm install --omit=dev

# --- Copy source code ---
COPY . .

# --- Port yang diexpose aplikasi ---
EXPOSE 3000

# --- Health check bawaan Docker ---
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD curl -f http://localhost:3000/health || exit 1

# --- Perintah menjalankan aplikasi ---
CMD ["node", "src/index.js"]
