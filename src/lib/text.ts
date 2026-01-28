// Common text messages and templates
export const Messages = {
    // Error messages
    COMPANY_NOT_FOUND: 'Company not found.',
    NO_COMPANIES_AVAILABLE: '🌍 No companies available yet.',
    INVALID_URL_FORMAT: "Planeteer, your URL doesn't seem to be in the correct format. Remember, the power is yours to provide a valid URL!",
    INVALID_URL_CANCELLED: `❌ That doesn't look like a valid URL. The add process has been cancelled.\n\n` + `Use /add to try again.`,
    GENERIC_ERROR: 'Sorry, something went wrong. Please try again later.',

    // Success messages
    REFERRAL_ADDED: (companyName: string) => `🌍 Great work, Planeteer! Your referral link for ${companyName} has been added. The power is yours! 🌍`,

    // No results messages
    NO_REFERRALS: (companyName: string) => `No referral links found for ${companyName} yet. Be the first Planeteer to add one!`,
    NO_REFERRALS_ERROR: (companyName: string) => `❌ No referral links found for ${companyName} yet.`,

    // Interactive messages
    CANCELLED: '❌ Add process cancelled.',
    CANCELLED_ALT: '❌ Cancelled.',
    NO_ACTIVE_PROCESS: 'No active add process to cancel.',

    // URL prompts
    SEND_URL: (companyName: string) => `📝 Please send the referral URL for ${companyName}:`,
    SEND_URL_INTERACTIVE: (companyName: string) => `📝 Now send me the referral URL for **${companyName}**:\n\n` + `Use /cancel to cancel this process.`,

    // Section headers
    ADD_HELP_HEADER: `🌍 *Add Your Referral Link* 🌍\n\n`,
    REF_SELECT_PROMPT: '🌍 Select a company to get a referral link:',
    REFS_HELP_HEADER: `🌍 *View All Referral Links* 🌍\n\n`,
    REFS_SELECT_PROMPT: 'Select a company to view all available referral links from our Planeteers:',
};

export const HelpTexts = {
    ADD_USAGE: `You can use this command in two ways:\n\n` + `1️⃣ *Traditional:* \`/add CompanyName https://your-referral-url.com\`\n` + `2️⃣ *Interactive:* Select a company below, then send the URL when prompted.\n\n` + `Select a company to add your referral link:`,

    HELP_MESSAGE: `🌍 *Greetings, Planeteer!* 🌍\n\n` + `I'm here to help you share the power of referral links!\n\n` + `*Commands:*\n` + `/ref [CompanyName?] - Get a random referral\n` + `/refs [CompanyName?] - View all referrals\n` + `/add [CompanyName?] [URL?] - Add your referral (DM only!)\n\n` + `💡 Tip: Leave out the company name to use interactive buttons!\n\n` + `⚡️ *Important:* Message me directly to add referrals, not in the group. The power is yours, but keep it private!\n\n` + `With our powers combined, we'll make the world a better place! 🌱`,
};

// Text formatting helpers
export function formatReferralLink(companyName: string, username: string, url: string): string {
    return `🌍 Here is a referral link for ${companyName} from Planeteer @${username}. Go Planet! 🌍\n${url}`;
}

export function formatReferralList(companyName: string, referrals: any[]): string {
    let responseMessage = `🌍 Here are the Planeteers' referral links for ${companyName}. The power is yours! 🌍\n`;
    for (const referral of referrals) {
        responseMessage += `• Planeteer @${referral.username}: ${referral.url}\n`;
    }
    return responseMessage;
}

export function formatInvalidCompanyError(allowedCompanies: string[]): string {
    return `By the power of Gaia, I must inform you that the company you've mentioned is not recognized. Please choose from the following: ${allowedCompanies.join(', ')}`;
}
