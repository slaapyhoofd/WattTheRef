import { Context } from 'telegraf';
import { getAllCompanies, getCompanyNames } from './database';

const AUTO_DELETE_DELAY_MS = 5 * 60 * 1000; // 5 minutes

type ReplyOptions = Parameters<Context['reply']>[1];

export async function replyAndDelete(ctx: Context, text: string, options?: ReplyOptions): Promise<void> {
    const message = await ctx.reply(text, options);
    scheduleDelete(ctx, message.message_id);
}

export async function replyHtmlAndDelete(ctx: Context, text: string, options?: Parameters<Context['replyWithHTML']>[1]): Promise<void> {
    const message = await ctx.replyWithHTML(text, options);
    scheduleDelete(ctx, message.message_id);
}

function scheduleDelete(ctx: Context, messageId: number): void {
    setTimeout(async () => {
        try {
            await ctx.deleteMessage(messageId);
        } catch (error) {
            // Silently ignore "message not found" errors - message was likely already deleted by user interaction
            if (error instanceof Error && error.message.includes('message to delete not found')) {
                return;
            }
            console.error(`[AUTO-DELETE] Failed to delete message ${messageId}:`, error);
        }
    }, AUTO_DELETE_DELAY_MS);
}

export async function buildCompanyKeyboard(callbackPrefix: string, cancelCallback: string) {
    const companies = await getAllCompanies();

    if (companies.length === 0) {
        return null;
    }

    return {
        inline_keyboard: [...companies.map((c) => [{ text: c.name, callback_data: `${callbackPrefix}_${c.id}` }]), [{ text: '❌ Cancel', callback_data: cancelCallback }]],
    };
}

export async function getInvalidCompanyMessage(): Promise<string> {
    const allowedCompanies = await getCompanyNames();
    return `By the power of Gaia, I must inform you that the company you've mentioned is not recognized. Please choose from the following: ${allowedCompanies.join(', ')}`;
}
