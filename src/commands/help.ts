import { Telegraf, Context } from 'telegraf';
import { logCommandStart, logCommandSuccess, logCommandError } from '../lib/logger';
import { replyAndDelete } from '../lib/helpers';
import { HelpTexts } from '../lib/text';

export function registerHelpCommand(bot: Telegraf<Context>) {
    bot.command('help', async (ctx) => {
        logCommandStart(ctx, 'help');
        try {
            await replyAndDelete(ctx, HelpTexts.HELP_MESSAGE, {
                parse_mode: 'Markdown',
            });
            logCommandSuccess(ctx, 'help');
        } catch (error) {
            logCommandError(ctx, 'help', error);
        }
    });

    // Also respond to /start command with help
    bot.command('start', async (ctx) => {
        logCommandStart(ctx, 'start');
        try {
            await replyAndDelete(ctx, HelpTexts.HELP_MESSAGE, {
                parse_mode: 'Markdown',
            });
            logCommandSuccess(ctx, 'start');
        } catch (error) {
            logCommandError(ctx, 'start', error);
        }
    });
}
