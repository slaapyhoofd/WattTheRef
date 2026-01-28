import { getAllCompanies, getCompanyNames } from './database';

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
