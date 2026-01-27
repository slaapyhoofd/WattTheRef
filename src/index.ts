import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { getCompanyNames, getCompanyByName, addReferral, getRandomReferral, getAllReferrals, disconnectDatabase } from './lib/database';

const bot = new Telegraf(process.env.BOT_TOKEN as string);

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

bot.command('refferals', async (ctx) => {
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
        console.error('Error in /refferals command:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
    }
});

// Global error handler
bot.catch((err, ctx) => {
    console.error('Unhandled bot error:', err);
    ctx.reply('An unexpected error occurred. Please try again later.').catch(console.error);
});

bot.launch();
console.log('WattTheRefBot started!');

// Graceful shutdown
process.once('SIGINT', () => {
    bot.stop('SIGINT');
    disconnectDatabase();
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    disconnectDatabase();
});
