FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm --workspace packages/shared run build
RUN npm --workspace apps/frontend run build

FROM nginx:1.25-alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
