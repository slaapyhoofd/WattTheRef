import { Telegraf, Context } from 'telegraf';
import { getCompanyByName, getRandomReferral, getCompanyById } from '../lib/database';
import { logCommandStart, logCommandSuccess, logCommandCancel, logCommandError } from '../lib/logger';
import { buildCompanyKeyboard, getInvalidCompanyMessage } from '../lib/helpers';

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
                    await ctx.reply(await getInvalidCompanyMessage());
                    return;
                }

                const randomReferral = await getRandomReferral(company.id);

                if (!randomReferral) {
                    await ctx.reply(`No referral links found for ${company.name} yet. Be the first Planeteer to add one!`);
                    logCommandSuccess(ctx, 'ref');
                    return;
                }

                await ctx.replyWithHTML(`🌍 Here is a referral link for ${company.name} from Planeteer @${randomReferral.username}. Go Planet! 🌍\n${randomReferral.url}`, { link_preview_options: { is_disabled: true } });
                logCommandSuccess(ctx, 'ref');
                return;
            }

            // No company provided - show selection buttons
            const keyboard = await buildCompanyKeyboard('ref', 'cancel_ref');

            if (!keyboard) {
                await ctx.reply('No companies available yet.');
                return;
            }

            await ctx.reply('🌍 Select a company to get a referral link:', {
                reply_markup: keyboard,
            });
        } catch (error) {
            logCommandError(ctx, 'ref', error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
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
                await ctx.answerCbQuery('Company not found');
                return;
            }

            const randomReferral = await getRandomReferral(company.id);

            if (!randomReferral) {
                await ctx.reply(`No referral links found for ${company.name} yet. Be the first Planeteer to add one!`);
                await ctx.answerCbQuery();
                logCommandSuccess(ctx, 'ref');
                return;
            }

            await ctx.replyWithHTML(`🌍 Here is a referral link for ${company.name} from Planeteer @${randomReferral.username}. Go Planet! 🌍\n${randomReferral.url}`, { link_preview_options: { is_disabled: true } });
            await ctx.answerCbQuery();
            logCommandSuccess(ctx, 'ref');
        } catch (error) {
            logCommandError(ctx, 'ref', error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
            await ctx.answerCbQuery();
        }
    });

    // Handle cancel button
    bot.action('cancel_ref', async (ctx) => {
        await ctx.reply('❌ Cancelled.');
        await ctx.answerCbQuery();
        logCommandCancel(ctx, 'ref');
    });
}
