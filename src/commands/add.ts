import { Telegraf, Context } from 'telegraf';
import { getCompanyNames, getCompanyByName, addReferral } from '../lib/database';

export function registerAddCommand(bot: Telegraf<Context>) {
    bot.command('add', async (ctx) => {
        try {
            if (!ctx.message || !('text' in ctx.message)) return;

            const parts = ctx.message.text.split(' ');
            const companyName = parts[1];
            const url = parts[2];
            const userId = `${ctx.from.id}`;
            const username = ctx.from.username ?? ctx.from.first_name;

            console.log(`${username}, ${ctx.message.text}`);

            if (!companyName) {
                const allowedCompanies = await getCompanyNames();
                await ctx.reply(`Please specify a company. Available: ${allowedCompanies.join(', ')}`);
                return;
            }

            if (!url) {
                await ctx.reply('Please provide a URL. Usage: /add [Company] [URL]');
                return;
            }

            const company = await getCompanyByName(companyName);
            if (!company) {
                const allowedCompanies = await getCompanyNames();
                await ctx.reply(`By the power of Gaia, I must inform you that the company you've mentioned is not recognized. Please choose from the following: ${allowedCompanies.join(', ')}`);
                return;
            }

            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[\w=&-]*)?$/;
            if (!urlRegex.test(url)) {
                await ctx.reply("Planeteer, your URL doesn't seem to be in the correct format. Remember, the power is yours to provide a valid URL!");
                return;
            }

            await addReferral(userId, username, company.id, url);

            await ctx.reply(`🌍 Great work, Planeteer! Your referral link for ${company.name} has been added. The power is yours! 🌍`);
        } catch (error) {
            console.error('Error in /add command:', error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
        }
    });
}
