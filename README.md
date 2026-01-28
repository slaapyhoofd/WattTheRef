# WattTheRef Bot

[![CI](https://github.com/slaapyhoofd/WattTheRef/actions/workflows/ci.yml/badge.svg)](https://github.com/slaapyhoofd/WattTheRef/actions/workflows/ci.yml)
[![Docker](https://github.com/slaapyhoofd/WattTheRef/actions/workflows/docker.yml/badge.svg)](https://github.com/slaapyhoofd/WattTheRef/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Greetings, Planeteers! This is your trusty Captain Planet Referral Bot, here to help manage your green energy referral links.

Our mission is to make the world a greener place, one referral at a time. With the power of your referral links, we can help more people join our cause and switch to clean energy. The power is yours!

## Bot Commands

**/add [company] [url]**

Use this command to add or update your referral link for a specific green energy company. Remember, the power is yours to provide a valid URL!

Example: `/add Tibber https://invite.tibber.com/myreferral`

**/ref [company]**

Use this command to get a random referral link for a specific green energy company, courtesy of a fellow Planeteer.

Example: `/ref Tibber`

**/refs [company]**

Use this command to list all the referral links for a specific green energy company. This will show you all the Planeteers who have shared their referral links for that company.

Example: `/refs Tibber`

## Setup

### Prerequisites

- Node.js 24+
- npm

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/slaapyhoofd/WattTheRef.git
    cd WattTheRef
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file with your Telegram bot token:

    ```
    BOT_TOKEN=your_telegram_bot_token_here
    ```

4. Initialize the database and seed companies:

    ```bash
    npm run db:push
    npm run db:seed
    ```

5. Build the project:

    ```bash
    npm run compile
    ```

6. Start the bot:
    ```bash
    npm start
    ```

### Development

Run with source maps for debugging:

```bash
npm run bundle
npm run dev
```

## Docker

### Using Docker Compose (recommended)

1. Create a `.env` file with your bot token:

    ```
    BOT_TOKEN=your_telegram_bot_token_here
    ```

2. Start the bot:

    ```bash
    docker compose up -d
    ```

3. To update to the latest version:

    ```bash
    docker compose pull
    docker compose up -d
    ```

### Using Docker directly

```bash
docker run -d --name watttheref \
  -e BOT_TOKEN=your_token_here \
  -v watttheref-data:/app/data \
  ghcr.io/slaapyhoofd/watttheref:latest
```

### Building locally

```bash
docker build -t watttheref .
docker run -d --name watttheref -e BOT_TOKEN=your_token_here -v watttheref-data:/app/data watttheref
```

The `-v watttheref-data:/app/data` mounts a named volume to persist the SQLite database across container updates.

On first run, the entrypoint script automatically initializes the database and seeds the companies. On subsequent runs, it uses the existing database from the volume.

## Database

This bot uses SQLite with Prisma ORM. The database is stored in `data/watttheref.db`.

### Available npm scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run compile`   | Build the project                 |
| `npm run bundle`    | Build with source maps            |
| `npm run dev`       | Run with source maps enabled      |
| `npm start`         | Run the bot                       |
| `npm run db:push`   | Push schema changes to database   |
| `npm run db:seed`   | Seed companies to database        |
| `npm run db:studio` | Open Prisma Studio to browse data |

### Adding new companies

Edit `prisma/seed.ts` and add the company name to the `companies` array, then run:

```bash
npm run db:seed
```

## Tech Stack

- **Runtime**: Node.js 24
- **Language**: TypeScript
- **Bot Framework**: Telegraf
- **Database**: SQLite
- **ORM**: Prisma

## License

MIT
