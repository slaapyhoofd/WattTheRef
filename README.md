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

### Getting a Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Start a conversation with BotFather and send `/newbot`
3. Follow the prompts:
    - Choose a name for your bot (e.g., "WattTheRef Bot")
    - Choose a username for your bot (must be unique and end with "bot", e.g., "@WattTheRef_bot")
4. BotFather will provide you with a token in this format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
5. Save this token - you'll need it in the `.env` file

### Adding the Bot to a Group or Topic

1. **Add the bot to the group**:
    - Go to Group Settings → Administrators
    - Click "Add Administrator"
    - Search for your bot by username (e.g., @WattTheRef_bot)
    - Select it and grant necessary permissions:
        - Send Messages
        - Edit Messages
        - Delete Messages
2. **Grant the bot admin privileges**:
    - Make sure the bot has permissions to post in the group and topics

Now you can use the bot commands in the group!

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

2. (Optional) Customize the user/group IDs and timezone in `docker-compose.yml`:

    ```yaml
    environment:
        - BOT_TOKEN=${BOT_TOKEN}
        - USER_ID=1000 # UID for the container process
        - GROUP_ID=1000 # GID for the container process
        - TZ=Europe/Amsterdam # Timezone for logging (e.g., Europe/Amsterdam, UTC, America/New_York)
    ```

3. Start the bot:

    ```bash
    docker compose up -d
    ```

4. To update to the latest version:

    ```bash
    docker compose pull
    docker compose up -d
    ```

### Using Docker directly

```bash
docker run -d --name watttheref \
  -e BOT_TOKEN=your_token_here \
  -e USER_ID=1000 \
  -e GROUP_ID=1000 \
  -e TZ=Europe/Amsterdam \
  -v watttheref-data:/app/data \
  ghcr.io/slaapyhoofd/watttheref:latest
```

### Building locally

```bash
docker build -t watttheref .
docker run -d --name watttheref \
  -e BOT_TOKEN=your_token_here \
  -e USER_ID=1000 \
  -e GROUP_ID=1000 \
  -e TZ=Europe/Amsterdam \
  -v watttheref-data:/app/data \
  watttheref
```

You can also customize USER_ID and GROUP_ID during build:

```bash
docker build -t watttheref --build-arg USER_ID=568 --build-arg GROUP_ID=568 .
```

**Environment Variables:**

- `BOT_TOKEN` (required): Your Telegram bot token
- `USER_ID` (optional, default: 1000): UID for the container process. Ensure this user exists on your host system
- `GROUP_ID` (optional, default: 1000): GID for the container process. Ensure this group exists on your host system
- `TZ` (optional, default: UTC): Timezone for logging timestamps (e.g., `Europe/Amsterdam`, `UTC`, `America/New_York`)

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
