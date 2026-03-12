#!/usr/bin/env bash
# Auto-installer for DF Portal on a fresh Ubuntu/Debian VPS.
# Usage (as root): DOMAIN=portal.example.com EMAIL=admin@example.com bash scripts/install-vps.sh

set -euo pipefail

DOMAIN="${DOMAIN:-portal.example.com}"
EMAIL="${EMAIL:-admin@example.com}"
REPO_DIR="/opt/df-portal"
REPO_URL="${REPO_URL:-https://github.com/dfnetwork/df-portal.git}"
STORAGE_DIR="/opt/df-portal/storage"
SERVICE_FILE="/etc/systemd/system/df-portal.service"

echo ">>> Ensuring prerequisites (curl, git, docker)..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg git lsb-release

. /etc/os-release
DOCKER_OS="${ID:-ubuntu}"
if [ "$DOCKER_OS" != "debian" ] && [ "$DOCKER_OS" != "ubuntu" ]; then
  DOCKER_OS="ubuntu" # sensible default
fi

if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/${DOCKER_OS}/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${DOCKER_OS} \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

echo ">>> Cloning/updating repository..."
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone --depth=1 "$REPO_URL" "$REPO_DIR"
else
  git -C "$REPO_DIR" remote set-url origin "$REPO_URL"
  git -C "$REPO_DIR" fetch --depth=1 origin
  git -C "$REPO_DIR" reset --hard origin/main
fi

echo ">>> Preparing environment..."
cd "$REPO_DIR"
mkdir -p "$STORAGE_DIR"
if [ ! -f apps/backend/.env ]; then
  cp apps/backend/.env.example apps/backend/.env
  sed -i "s|your.domain|$DOMAIN|g" docker/nginx.conf
  echo "JWT_SECRET=$(openssl rand -hex 32)" >> apps/backend/.env
fi

echo ">>> Making deploy script executable"
chmod +x scripts/deploy.sh

echo ">>> Building and starting containers..."
docker compose -f docker/docker-compose.yml up -d --build

echo ">>> Running database migrations..."
docker compose -f docker/docker-compose.yml exec backend npx prisma migrate deploy

echo ">>> Obtaining TLS certificate (Let's Encrypt)..."
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" || true

echo ">>> Reloading nginx..."
docker compose -f docker/docker-compose.yml exec nginx nginx -s reload || true

echo ">>> Installing systemd service for auto-restart"
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=DF Portal stack
After=network.target docker.service
Requires=docker.service

[Service]
Type=oneshot
WorkingDirectory=$REPO_DIR
ExecStart=/usr/bin/docker compose -f docker/docker-compose.yml up -d
ExecStop=/usr/bin/docker compose -f docker/docker-compose.yml down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now df-portal

cat <<'EOF'
Installation finished.
- Ensure DNS A record points to this VPS for: '"$DOMAIN"'
- Initial admin: create via API or database seed.
- Renew certs: add cron '0 3 * * * docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot renew --webroot -w /var/www/certbot && docker compose -f /opt/df-portal/docker/docker-compose.yml exec nginx nginx -s reload'
EOF
