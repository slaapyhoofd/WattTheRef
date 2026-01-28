import { Telegraf, Context } from 'telegraf';
import { getCompanyNames, getCompanyByName, getAllReferrals, getAllCompanies, getCompanyById } from '../lib/database';
import { logCommandStart, logCommandSuccess, logCommandError } from '../lib/logger';
import { replyAndDelete } from '../lib/helpers';
import { Messages, formatReferralList, formatInvalidCompanyError } from '../lib/text';

function getNoReferralsMessage(companyName: string): string {
    return Messages.NO_REFERRALS_ERROR(companyName);
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
                    await replyAndDelete(ctx, formatInvalidCompanyError(allowedCompanies));
                    return;
                }

                const referrals = await getAllReferrals(company.id);

                if (referrals.length === 0) {
                    await replyAndDelete(ctx, getNoReferralsMessage(company.name));
                    return;
                }

                const responseMessage = formatReferralList(company.name, referrals);
                await ctx.replyWithHTML(responseMessage, { link_preview_options: { is_disabled: true } });
                logCommandSuccess(ctx, 'refs');
                return;
            }

            // If no company provided, show company selection buttons
            const companies = await getAllCompanies();

            if (companies.length === 0) {
                await replyAndDelete(ctx, Messages.NO_COMPANIES_AVAILABLE);
                return;
            }

            const keyboard = {
                inline_keyboard: [...companies.map((c) => [{ text: c.name, callback_data: `refs_${c.id}` }])],
            };

            const helpText = Messages.REFS_HELP_HEADER + Messages.REFS_SELECT_PROMPT;

            await replyAndDelete(ctx, helpText, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
            logCommandSuccess(ctx, 'refs');
        } catch (error) {
            logCommandError(ctx, 'refs', error);
            await replyAndDelete(ctx, Messages.GENERIC_ERROR);
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
                await replyAndDelete(ctx, Messages.COMPANY_NOT_FOUND);
                await ctx.answerCbQuery();
                return;
            }

            const referrals = await getAllReferrals(company.id);

            if (referrals.length === 0) {
                await ctx.deleteMessage();
                await ctx.answerCbQuery();
                await replyAndDelete(ctx, getNoReferralsMessage(company.name));
                return;
            }

            const responseMessage = formatReferralList(company.name, referrals);
            await ctx.deleteMessage();
            await ctx.replyWithHTML(responseMessage, { link_preview_options: { is_disabled: true } });
            await ctx.answerCbQuery();
            logCommandSuccess(ctx, 'refs');
        } catch (error) {
            logCommandError(ctx, 'refs', error);
            await replyAndDelete(ctx, Messages.GENERIC_ERROR);
            await ctx.answerCbQuery();
        }
    });
}
