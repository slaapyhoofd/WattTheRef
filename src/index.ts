import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { JSONFilePreset } from 'lowdb/node';

interface Referral {
    url: string;
    username: string;
}

interface CompanyReferrals {
    [userId: string]: Referral;
}

interface Referrals {
    [company: string]: CompanyReferrals;
}

interface Database {
    referrals: Referrals;
}

const allowedCompanies = ['FrankEnergie', 'HomeWizard', 'Tesla', 'Tibber', 'Quatt', 'WeHeat'];
const defaultData: Database = {
    referrals: {
        FrankEnergie: {},
        HomeWizard: {},
        Tesla: {},
        Tibber: {},
        Quatt: {},
        WeHeat: {},
    },
};

const bot = new Telegraf(process.env.BOT_TOKEN as string);

async function start() {
    // Read or create db.json
    const db = await JSONFilePreset<Database>('db.json', defaultData);

    bot.command('refferal', async (ctx) => {
        // @ts-ignore
        const [command, company, url] = ctx.message.text.split(' ');
        const userId = `${ctx.from.id}`;
        const username = ctx.from.username || ctx.from.first_name;

        console.log(`${username}, ${ctx.message.text}`);

        if (!allowedCompanies.includes(company as string)) {
            ctx.reply(`By the power of Gaia, I must inform you that the company you've mentioned is not recognized. Please choose from the following: ${allowedCompanies.join(', ')}`);
            return;
        }

        if (url) {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRegex.test(url)) {
                ctx.reply("Planeteer, your URL doesn't seem to be in the correct format. Remember, the power is yours to provide a valid URL!");
                return;
            }

            await db.update(({ referrals }) => {
                const dbCompany = referrals[company as string] || {};
                dbCompany[userId] = { url, username };
                referrals[company as string] = dbCompany;

                ctx.reply(`🌍 Great work, Planeteer! Your referral link for ${company} has been added. The power is yours! 🌍`);
            });
        } else {
            // Return a random referral link.
            const referrals = db.data.referrals[company as string] || {};
            const referralIds = Object.keys(referrals);
            const randomReferralId = referralIds[Math.floor(Math.random() * referralIds.length)] as string;
            const randomUrl = referrals[randomReferralId]?.url;
            const randomUsername = referrals[randomReferralId]?.username;

            ctx.replyWithHTML(`🌍 Here is a referral link for ${company} from Planeteer @${randomUsername}. Go Planet! 🌍\n${randomUrl}`, { link_preview_options: { is_disabled: true } });
        }
    });

    bot.command('refferals', (ctx) => {
        // @ts-ignore
        const [command, company] = ctx.message.text.split(' ');
        const refferals = db.data.referrals[company as string];
        const username = ctx.from.username || ctx.from.first_name;
        let message = `🌍 Here are the Planeteers' referral links for ${company}. The power is yours! 🌍\n`;

        console.log(`${username}, ${ctx.message.text}`);

        for (const referralId in refferals) {
            if (refferals[referralId]) {
                message += `• Planeteer @${refferals[referralId].username}: ${refferals[referralId].url}\n`;
            }
        }

        ctx.replyWithHTML(message, { link_preview_options: { is_disabled: true } });
    });
}

start()
    .then(() => {
        bot.launch();
        console.log('WattTheRefBot started!');
    })
    .catch((e) => console.error(e));
