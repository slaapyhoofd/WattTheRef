import { Telegraf, Context } from 'telegraf';
import { getCompanyNames, getCompanyByName, getAllReferrals, getAllCompanies, getCompanyById } from '../lib/database';
import { logCommandStart, logCommandSuccess, logCommandError } from '../lib/logger';
import { replyAndDelete } from '../lib/helpers';

function buildReferralMessage(companyName: string, referrals: any[]): string {
    let responseMessage = `🌍 Here are the Planeteers' referral links for ${companyName}. The power is yours! 🌍\n`;
    for (const referral of referrals) {
        responseMessage += `• Planeteer @${referral.username}: ${referral.url}\n`;
    }
    return responseMessage;
}

function getNoReferralsMessage(companyName: string): string {
    return `❌ No referral links found for ${companyName} yet.`;
}

export function registerRefsCommand(bot: Telegraf<Context>) {
    bot.command('refs', async (ctx) => {
        logCommandStart(ctx, 'refs');
        try {
            if (!ctx.message || !('text' in ctx.message)) return;

            const parts = ctx.message.text.split(' ');
            const companyName = parts[1];

            // If company provided, use traditional behavior
            if (companyName) {
                const company = await getCompanyByName(companyName);
                if (!company) {
                    const allowedCompanies = await getCompanyNames();
                    await replyAndDelete(ctx, `By the power of Gaia, I must inform you that the company you've mentioned is not recognized. Please choose from the following: ${allowedCompanies.join(', ')}`);
                    return;
                }

                const referrals = await getAllReferrals(company.id);

                if (referrals.length === 0) {
                    await replyAndDelete(ctx, getNoReferralsMessage(company.name));
                    return;
                }

                const responseMessage = buildReferralMessage(company.name, referrals);
                await ctx.replyWithHTML(responseMessage, { link_preview_options: { is_disabled: true } });
                logCommandSuccess(ctx, 'refs');
                return;
            }

            // If no company provided, show company selection buttons
            const companies = await getAllCompanies();

            if (companies.length === 0) {
                await replyAndDelete(ctx, '🌍 No companies available yet.');
                return;
            }

            const keyboard = {
                inline_keyboard: [...companies.map((c) => [{ text: c.name, callback_data: `refs_${c.id}` }])],
            };

            const helpText = `🌍 *View All Referral Links* 🌍\n\n` + `Select a company to view all available referral links from our Planeteers:`;

            await replyAndDelete(ctx, helpText, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
            logCommandSuccess(ctx, 'refs');
        } catch (error) {
            logCommandError(ctx, 'refs', error);
            await replyAndDelete(ctx, 'Sorry, something went wrong. Please try again later.');
        }
    });

    // Handle company selection via callback
    bot.action(/^refs_(\d+)$/, async (ctx) => {
        const match = ctx.match[1];
        if (!match) return;

        const companyId = parseInt(match);

        try {
            const company = await getCompanyById(companyId);
            if (!company) {
                await replyAndDelete(ctx, 'Company not found.');
                await ctx.answerCbQuery();
                return;
            }

            const referrals = await getAllReferrals(company.id);

            if (referrals.length === 0) {
                await ctx.answerCbQuery();
                await replyAndDelete(ctx, getNoReferralsMessage(company.name));
                return;
            }

            const responseMessage = buildReferralMessage(company.name, referrals);
            await ctx.replyWithHTML(responseMessage, { link_preview_options: { is_disabled: true } });
            await ctx.answerCbQuery();
            logCommandSuccess(ctx, 'refs');
        } catch (error) {
            logCommandError(ctx, 'refs', error);
            await replyAndDelete(ctx, 'Sorry, something went wrong. Please try again later.');
            await ctx.answerCbQuery();
        }
    });
}
