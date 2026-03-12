FROM node:20-alpine AS builder
WORKDIR /app
# Copy entire repo (needed for file: deps)
COPY . .
# Install dependencies for all workspaces
RUN npm install
# Build shared types (optional but keeps dist consistent)
RUN npm --workspace packages/shared run build
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
