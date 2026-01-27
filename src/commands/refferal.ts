import { Telegraf, Context } from 'telegraf';
import { getCompanyNames, getCompanyByName, getRandomReferral } from '../lib/database';

export function registerRefferalCommand(bot: Telegraf<Context>) {
    bot.command('refferal', async (ctx) => {
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

            // Return a random referral link
            const randomReferral = await getRandomReferral(company.id);

            if (!randomReferral) {
                await ctx.reply(`No referral links found for ${company.name} yet. Be the first Planeteer to add one!`);
                return;
            }

            await ctx.replyWithHTML(`🌍 Here is a referral link for ${company.name} from Planeteer @${randomReferral.username}. Go Planet! 🌍\n${randomReferral.url}`, { link_preview_options: { is_disabled: true } });
        } catch (error) {
            console.error('Error in /refferal command:', error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
        }
    });
}
