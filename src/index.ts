import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { disconnectDatabase } from './lib/database';
import { registerAddCommand } from './commands/add';
import { registerRefCommand } from './commands/ref';
import { registerRefsCommand } from './commands/refs';
import { registerHelpCommand } from './commands/help';

const bot = new Telegraf(process.env.BOT_TOKEN as string);

// Register commands
registerHelpCommand(bot);
registerAddCommand(bot);
registerRefCommand(bot);
registerRefsCommand(bot);

// Global error handler
bot.catch((err, ctx) => {
    console.error('Unhandled bot error:', err);
    ctx.reply('An unexpected error occurred. Please try again later.').catch(console.error);
});

bot.launch();
console.log('WattTheRefBot started!');

// Graceful shutdown
process.once('SIGINT', () => {
    bot.stop('SIGINT');
    disconnectDatabase();
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    disconnectDatabase();
});
