# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first (layer cache)
COPY backend/package*.json ./
RUN npm ci

# Copy source
COPY backend/ ./

# Generate Prisma Client BEFORE building
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Verify the build output exists
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found after build!" && ls -la dist/ && exit 1)

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy only production dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Generate Prisma Client in production stage too
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]