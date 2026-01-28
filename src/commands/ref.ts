import { Telegraf, Context } from 'telegraf';
import { getCompanyNames, getCompanyByName, getRandomReferral } from '../lib/database';
import { logCommandStart, logCommandSuccess, logCommandError } from '../lib/logger';

export function registerRefCommand(bot: Telegraf<Context>) {
    bot.command('ref', async (ctx) => {
        logCommandStart(ctx, 'ref');
        try {
            if (!ctx.message || !('text' in ctx.message)) return;

            const parts = ctx.message.text.split(' ');
            const companyName = parts[1];

            if (!companyName) {
                const allowedCompanies = await getCompanyNames();
                await ctx.reply(`Please specify a company. Available: ${allowedCompanies.join(', ')}`);
                return;
            }

            const company = await getCompanyByName(companyName);
            if (!company) {
                const allowedCompanies = await getCompanyNames();
                await ctx.reply(`By the power of Gaia, I must inform you that the company you've mentioned is not recognized. Please choose from the following: ${allowedCompanies.join(', ')}`);
                return;
            }

            // Return a random referral link
            const randomReferral = await getRandomReferral(company.id);

            if (!randomReferral) {
                await ctx.reply(`No referral links found for ${company.name} yet. Be the first Planeteer to add one!`);
                return;
            }

            await ctx.replyWithHTML(`🌍 Here is a referral link for ${company.name} from Planeteer @${randomReferral.username}. Go Planet! 🌍\n${randomReferral.url}`, { link_preview_options: { is_disabled: true } });
            logCommandSuccess(ctx, 'ref');
        } catch (error) {
            logCommandError(ctx, 'ref', error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
        }
    });
}
