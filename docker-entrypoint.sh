#!/bin/sh
set -e

# Default to UID/GID 1000 if not specified
USER_ID=${USER_ID:-1000}
GROUP_ID=${GROUP_ID:-1000}

echo "Starting with UID:GID = $USER_ID:$GROUP_ID"

# Create group if it doesn't exist
if ! getent group appgroup > /dev/null 2>&1; then
    groupadd -g "$GROUP_ID" appgroup
fi

# Create user if it doesn't exist
if ! getent passwd appuser > /dev/null 2>&1; then
    useradd -u "$USER_ID" -g "$GROUP_ID" -d /app -s /bin/sh appuser
fi

# Ensure data directory exists and has correct ownership
mkdir -p /app/data
chown -R "$USER_ID:$GROUP_ID" /app/data

# Initialize database if it doesn't exist (run as appuser)
if [ ! -f /app/data/watttheref.db ]; then
    echo "Initializing database..."
    gosu appuser npx prisma db push
    gosu appuser npm run db:seed
    echo "Database initialized!"
fi

# Start the bot as appuser
exec gosu appuser npm start
