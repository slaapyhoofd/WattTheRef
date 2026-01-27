#!/bin/sh
set -e

# Initialize database if it doesn't exist
if [ ! -f /app/data/watttheref.db ]; then
    echo "Initializing database..."
    npx prisma db push
    npm run db:seed
    echo "Database initialized!"
fi

# Start the bot
exec npm start
