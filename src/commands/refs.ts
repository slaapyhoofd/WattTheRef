import { Telegraf, Context } from 'telegraf';
import { getCompanyNames, getCompanyByName, getAllReferrals } from '../lib/database';

export function registerRefsCommand(bot: Telegraf<Context>) {
    bot.command('refs', async (ctx) => {
        try {
            if (!ctx.message || !('text' in ctx.message)) return;

            const parts = ctx.message.text.split(' ');
            const companyName = parts[1];
            const username = ctx.from.username ?? ctx.from.first_name;

            console.log(`${username}, ${ctx.message.text}`);

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

            const referrals = await getAllReferrals(company.id);

            if (referrals.length === 0) {
                await ctx.reply(`No referral links found for ${company.name} yet.`);
                return;
            }

            let responseMessage = `🌍 Here are the Planeteers' referral links for ${company.name}. The power is yours! 🌍\n`;
            for (const referral of referrals) {
                responseMessage += `• Planeteer @${referral.username}: ${referral.url}\n`;
            }

            await ctx.replyWithHTML(responseMessage, { link_preview_options: { is_disabled: true } });
        } catch (error) {
            console.error('Error in /refs command:', error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
        }
    });
}
