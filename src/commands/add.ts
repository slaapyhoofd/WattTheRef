import { Telegraf, Context } from 'telegraf';
import { getCompanyNames, getCompanyByName, addReferral, getAllCompanies, getCompanyById } from '../lib/database';
import { logCommandStart, logCommandSuccess, logCommandCancel, logCommandError } from '../lib/logger';

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
            await ctx.reply('❌ Add process cancelled.');
            logCommandCancel(ctx, 'add');
        } else {
            await ctx.reply('No active add process to cancel.');
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
                    const allowedCompanies = await getCompanyNames();
                    await ctx.reply(`By the power of Gaia, I must inform you that the company you've mentioned is not recognized. Please choose from the following: ${allowedCompanies.join(', ')}`);
                    return;
                }

                const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[\w=&-]*)?$/;
                if (!urlRegex.test(url)) {
                    await ctx.reply("Planeteer, your URL doesn't seem to be in the correct format. Remember, the power is yours to provide a valid URL!");
                    return;
                }

                await addReferral(`${userId}`, username, company.id, url);
                await ctx.reply(`🌍 Great work, Planeteer! Your referral link for ${company.name} has been added. The power is yours! 🌍`);
                logCommandSuccess(ctx, 'add');
                return;
            }

            // If only company provided, ask for URL
            if (companyName) {
                const company = await getCompanyByName(companyName);
                if (!company) {
                    const allowedCompanies = await getCompanyNames();
                    await ctx.reply(`By the power of Gaia, I must inform you that the company you've mentioned is not recognized. Please choose from the following: ${allowedCompanies.join(', ')}`);
                    return;
                }

                pendingSelections.set(userId, company.id);
                await ctx.reply(`📝 Please send the referral URL for ${company.name}:`);
                return;
            }

            // If no args, show company selection buttons and usage info
            const companies = await getAllCompanies();

            if (companies.length === 0) {
                await ctx.reply('No companies available yet.');
                return;
            }

            const keyboard = {
                inline_keyboard: [...companies.map((c) => [{ text: c.name, callback_data: `add_${c.id}` }]), [{ text: '❌ Cancel', callback_data: 'cancel_add' }]],
            };

            const helpText = `🌍 *Add Your Referral Link* 🌍\n\n` + `You can use this command in two ways:\n\n` + `1️⃣ *Traditional:* \`/add CompanyName https://your-referral-url.com\`\n` + `2️⃣ *Interactive:* Select a company below, then send the URL when prompted.\n\n` + `Select a company to add your referral link:`;

            await ctx.reply(helpText, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
        } catch (error) {
            logCommandError(ctx, 'add', error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
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
        await ctx.reply(`📝 Now send me the referral URL for **${company.name}**:\n\n` + `Use /cancel to cancel this process.`, { parse_mode: 'Markdown' });
        await ctx.answerCbQuery();
    });

    // Handle cancel button
    bot.action('cancel_add', async (ctx) => {
        const userId = ctx.from.id;
        pendingSelections.delete(userId);
        await ctx.reply('❌ Add process cancelled.');
        await ctx.answerCbQuery();
        logCommandCancel(ctx, 'add');
    });

    // Handle URL input after company selection
    bot.on('text', async (ctx) => {
        if (!ctx.message || !('text' in ctx.message)) return;
        if (ctx.message.text.startsWith('/')) return; // Skip commands

        const userId = ctx.from.id;
        const companyId = pendingSelections.get(userId);

        // Only process if this user has a pending company selection
        if (!companyId) return;

        try {
            const url = ctx.message.text;
            const username = ctx.from.username ?? ctx.from.first_name;

            const company = await getCompanyById(companyId);
            if (!company) {
                await ctx.reply('❌ Company not found. Process cancelled.');
                pendingSelections.delete(userId);
                return;
            }

            if (!urlRegex.test(url)) {
                await ctx.reply(`❌ That doesn't look like a valid URL. The add process has been cancelled.\n\n` + `Use /add to try again.`, { parse_mode: 'Markdown' });
                pendingSelections.delete(userId);
                return;
            }

            await addReferral(`${userId}`, username, company.id, url);
            await ctx.reply(`🌍 Great work, Planeteer! Your referral link for ${company.name} has been added. The power is yours! 🌍`);
            pendingSelections.delete(userId);
            logCommandSuccess(ctx, 'add');
        } catch (error) {
            logCommandError(ctx, 'add', error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
            pendingSelections.delete(userId);
        }
    });
}
