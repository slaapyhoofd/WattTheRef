import { Context } from 'telegraf';

function getTimestamp(): string {
    const tz = process.env.TZ || 'UTC';
    return new Date().toLocaleString('en-US', { timeZone: tz });
}

function getUserInfo(ctx: Context): string {
    const username = ctx.from?.username ?? ctx.from?.first_name ?? 'unknown';
    const userId = ctx.from?.id ?? 'unknown';
    return `@${username} (${userId})`;
}

export function logCommandStart(ctx: Context, command: string): void {
    console.log(`[${getTimestamp()}] START /${command} - ${getUserInfo(ctx)}`);
}

export function logCommandSuccess(ctx: Context, command: string): void {
    console.log(`[${getTimestamp()}] SUCCESS /${command} - ${getUserInfo(ctx)}`);
}

export function logCommandCancel(ctx: Context, command: string): void {
    console.log(`[${getTimestamp()}] CANCELLED /${command} - ${getUserInfo(ctx)}`);
}

export function logCommandError(ctx: Context, command: string, error: unknown): void {
    console.error(`[${getTimestamp()}] ERROR /${command} - ${getUserInfo(ctx)}:`, error);
}
