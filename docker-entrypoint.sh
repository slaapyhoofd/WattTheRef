#!/bin/sh
set -e

# Default to UID/GID 1000 if not specified
USER_ID=${USER_ID:-1000}
GROUP_ID=${GROUP_ID:-1000}

echo "Starting with UID:GID = $USER_ID:$GROUP_ID"

# Create group if GID doesn't exist, otherwise use existing group
if ! getent group "$GROUP_ID" > /dev/null 2>&1; then
    groupadd -g "$GROUP_ID" appgroup
fi

# Create user if UID doesn't exist, otherwise use existing user
if ! getent passwd "$USER_ID" > /dev/null 2>&1; then
    useradd -u "$USER_ID" -g "$GROUP_ID" -d /app -s /bin/sh -M appuser
fi

# Ensure data directory exists and has correct ownership
mkdir -p /app/data
chown -R "$USER_ID:$GROUP_ID" /app/data

# Initialize database if it doesn't exist
if [ ! -f /app/data/watttheref.db ]; then
    echo "Initializing database..."
    gosu "$USER_ID:$GROUP_ID" npx prisma db push
    gosu "$USER_ID:$GROUP_ID" npm run db:seed
    echo "Database initialized!"
fi

# Start the bot
exec gosu "$USER_ID:$GROUP_ID" npm start
