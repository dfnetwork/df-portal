FROM node:20-alpine AS builder
WORKDIR /app
# Copy root manifests and workspaces
COPY package.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
# Install deps (no lockfile to avoid npm ci failure)
RUN npm install
# Copy source
COPY . .
# Build backend
RUN npm --workspace apps/backend run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
