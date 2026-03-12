#!/usr/bin/env bash
# Create or update the initial global admin user.
# Usage: EMAIL=admin@example.com PASSWORD=secret bash scripts/create-admin.sh
set -euo pipefail

EMAIL="${EMAIL:-}"
PASSWORD="${PASSWORD:-}"
NAME="${NAME:-Admin}"
COMPOSE_FILE=${COMPOSE_FILE:-docker/docker-compose.yml}

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "EMAIL and PASSWORD are required. Example:"
  echo "  EMAIL=admin@example.com PASSWORD=SuperSecret bash scripts/create-admin.sh"
  exit 1
fi

docker compose -f "$COMPOSE_FILE" run --rm backend node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient, Role, Provider } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(process.env.PASSWORD, 10);
  const data = {
    email: process.env.EMAIL,
    name: process.env.NAME || 'Admin',
    passwordHash,
    role: Role.OWNER,
  };
  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: data,
    create: {
      ...data,
      authProviders: { create: { provider: Provider.EMAIL, providerId: data.email } },
    },
  });
  console.log('Admin ready:', { id: user.id, email: user.email, role: user.role });
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
" EMAIL="$EMAIL" PASSWORD="$PASSWORD" NAME="$NAME"
