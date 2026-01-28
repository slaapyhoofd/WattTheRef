import { Telegraf, Context } from 'telegraf';
import { getCompanyByName, addReferral, getCompanyById } from '../lib/database';
import { logCommandStart, logCommandSuccess, logCommandCancel, logCommandError } from '../lib/logger';
import { buildCompanyKeyboard, getInvalidCompanyMessage, replyAndDelete } from '../lib/helpers';
import { Messages, HelpTexts } from '../lib/text';

// Store pending company selections temporarily (userId -> companyId)
const pendingSelections = new Map<number, number>();

// URL validation regex
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[\w=&-]*)?$/;

export function registerAddCommand(bot: Telegraf<Context>) {
    bot.command('cancel', async (ctx) => {
        logCommandStart(ctx, 'cancel');
        const userId = ctx.from.id;
        if (pendingSelections.has(userId)) {
            pendingSelections.delete(userId);
            await replyAndDelete(ctx, Messages.CANCELLED);
            logCommandCancel(ctx, 'add');
        } else {
            await replyAndDelete(ctx, Messages.NO_ACTIVE_PROCESS);
            logCommandSuccess(ctx, 'cancel');
        }
    });
    bot.command('add', async (ctx) => {
        logCommandStart(ctx, 'add');
        try {
            if (!ctx.message || !('text' in ctx.message)) return;

            const parts = ctx.message.text.split(' ');
            const companyName = parts[1];
            const url = parts[2];
            const userId = ctx.from.id;
            const username = ctx.from.username ?? ctx.from.first_name;

            // If both company and URL provided, use traditional behavior
            if (companyName && url) {
                const company = await getCompanyByName(companyName);
                if (!company) {
                    await replyAndDelete(ctx, await getInvalidCompanyMessage());
                    return;
                }

                const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[\w=&-]*)?$/;
                if (!urlRegex.test(url)) {
                    await replyAndDelete(ctx, Messages.INVALID_URL_FORMAT);
                    return;
                }

                await addReferral(`${userId}`, username, company.id, url);
                await replyAndDelete(ctx, Messages.REFERRAL_ADDED(company.name));
                logCommandSuccess(ctx, 'add');
                return;
            }

            // If only company provided, ask for URL
            if (companyName) {
                const company = await getCompanyByName(companyName);
                if (!company) {
                    await replyAndDelete(ctx, await getInvalidCompanyMessage());
                    return;
                }

                pendingSelections.set(userId, company.id);
                await replyAndDelete(ctx, Messages.SEND_URL(company.name));
                return;
            }

            // If no args, show company selection buttons and usage info
            const keyboard = await buildCompanyKeyboard('add', 'cancel_add');

            if (!keyboard) {
                await replyAndDelete(ctx, Messages.NO_COMPANIES_AVAILABLE);
                return;
            }

            const helpText = Messages.ADD_HELP_HEADER + HelpTexts.ADD_USAGE;

            await replyAndDelete(ctx, helpText, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
        } catch (error) {
            logCommandError(ctx, 'add', error);
            await replyAndDelete(ctx, Messages.GENERIC_ERROR);
        }
    });

    // Handle company selection via callback
    bot.action(/^add_(\d+)$/, async (ctx) => {
        const match = ctx.match[1];
        if (!match) return;

        const companyId = parseInt(match);
        const userId = ctx.from.id;

        const company = await getCompanyById(companyId);
        if (!company) {
            await ctx.answerCbQuery('Company not found');
            return;
        }

        pendingSelections.set(userId, companyId);
        await replyAndDelete(ctx, Messages.SEND_URL_INTERACTIVE(company.name), { parse_mode: 'Markdown' });
        await ctx.answerCbQuery();
    });

    // Handle cancel button
    bot.action('cancel_add', async (ctx) => {
        const userId = ctx.from.id;
        pendingSelections.delete(userId);
        await replyAndDelete(ctx, Messages.CANCELLED);
        await ctx.answerCbQuery();
        logCommandCancel(ctx, 'add');
    });

    // Handle URL input after company selection
    bot.on('text', async (ctx, next) => {
        if (!ctx.message || !('text' in ctx.message)) return next();
        if (ctx.message.text.startsWith('/')) return next(); // Skip commands

        const userId = ctx.from.id;
        const companyId = pendingSelections.get(userId);

        // Only process if this user has a pending company selection
        if (!companyId) return next();

        try {
            const url = ctx.message.text;
            const username = ctx.from.username ?? ctx.from.first_name;

            const company = await getCompanyById(companyId);
            if (!company) {
                await replyAndDelete(ctx, Messages.COMPANY_NOT_FOUND);
                pendingSelections.delete(userId);
                return;
            }

            if (!urlRegex.test(url)) {
                await replyAndDelete(ctx, Messages.INVALID_URL_CANCELLED, { parse_mode: 'Markdown' });
                pendingSelections.delete(userId);
                return;
            }

            await addReferral(`${userId}`, username, company.id, url);
            await replyAndDelete(ctx, Messages.REFERRAL_ADDED(company.name));
            pendingSelections.delete(userId);
            logCommandSuccess(ctx, 'add');
        } catch (error) {
            logCommandError(ctx, 'add', error);
            await replyAndDelete(ctx, 'Sorry, something went wrong. Please try again later.');
            pendingSelections.delete(userId);
        }
    });
}
