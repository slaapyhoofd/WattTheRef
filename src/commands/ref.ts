import { Telegraf, Context } from 'telegraf';
import { getCompanyByName, getRandomReferral, getCompanyById } from '../lib/database';
import { logCommandStart, logCommandSuccess, logCommandCancel, logCommandError } from '../lib/logger';
import { buildCompanyKeyboard, getInvalidCompanyMessage, replyAndDelete } from '../lib/helpers';
import { Messages, formatReferralLink } from '../lib/text';

export function registerRefCommand(bot: Telegraf<Context>) {
    bot.command('ref', async (ctx) => {
        logCommandStart(ctx, 'ref');
        try {
            if (!ctx.message || !('text' in ctx.message)) return;

            const parts = ctx.message.text.split(' ');
            const companyName = parts[1];

            // If company provided, get referral directly
            if (companyName) {
                const company = await getCompanyByName(companyName);
                if (!company) {
                    await replyAndDelete(ctx, await getInvalidCompanyMessage());
                    return;
                }

                const randomReferral = await getRandomReferral(company.id);

                if (!randomReferral) {
                    await replyAndDelete(ctx, Messages.NO_REFERRALS(company.name));
                    logCommandSuccess(ctx, 'ref');
                    return;
                }

                await ctx.replyWithHTML(formatReferralLink(company.name, randomReferral.username, randomReferral.url), { link_preview_options: { is_disabled: true } });
                logCommandSuccess(ctx, 'ref');
                return;
            }

            // No company provided - show selection buttons
            const keyboard = await buildCompanyKeyboard('ref', 'cancel_ref');

            if (!keyboard) {
                await replyAndDelete(ctx, Messages.NO_COMPANIES_AVAILABLE);
                return;
            }

            await replyAndDelete(ctx, Messages.REF_SELECT_PROMPT, {
                reply_markup: keyboard,
            });
        } catch (error) {
            logCommandError(ctx, 'ref', error);
            await replyAndDelete(ctx, Messages.GENERIC_ERROR);
        }
    });

    // Handle company selection via callback
    bot.action(/^ref_(\d+)$/, async (ctx) => {
        const match = ctx.match[1];
        if (!match) return;

        const companyId = parseInt(match);

        try {
            const company = await getCompanyById(companyId);
            if (!company) {
                await replyAndDelete(ctx, Messages.COMPANY_NOT_FOUND);
                await ctx.answerCbQuery();
                return;
            }

            const randomReferral = await getRandomReferral(company.id);

            if (!randomReferral) {
                await ctx.deleteMessage();
                await replyAndDelete(ctx, Messages.NO_REFERRALS(company.name));
                await ctx.answerCbQuery();
                logCommandSuccess(ctx, 'ref');
                return;
            }

            // Referral link message persists for user access
            await ctx.deleteMessage();
            await ctx.replyWithHTML(formatReferralLink(company.name, randomReferral.username, randomReferral.url), { link_preview_options: { is_disabled: true } });
            await ctx.answerCbQuery();
            logCommandSuccess(ctx, 'ref');
        } catch (error) {
            logCommandError(ctx, 'ref', error);
            await replyAndDelete(ctx, Messages.GENERIC_ERROR);
            await ctx.answerCbQuery();
        }
    });

    // Handle cancel button
    bot.action('cancel_ref', async (ctx) => {
        await ctx.deleteMessage();
        await replyAndDelete(ctx, Messages.CANCELLED_ALT);
        await ctx.answerCbQuery();
        logCommandCancel(ctx, 'ref');
    });
}
