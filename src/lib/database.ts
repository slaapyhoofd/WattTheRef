import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Initialize SQLite database
const adapter = new PrismaBetterSqlite3({ url: './data/watttheref.db' });
export const prisma = new PrismaClient({ adapter });

export async function getCompanyNames(): Promise<string[]> {
    const companies = await prisma.company.findMany({ select: { name: true } });
    return companies.map((c) => c.name);
}

export async function getCompanyByName(name: string) {
    return prisma.company.findUnique({ where: { name } });
}

export async function addReferral(userId: string, username: string, companyId: number, url: string) {
    return prisma.referral.upsert({
        where: { userId_companyId: { userId, companyId } },
        update: { url, username },
        create: { userId, username, companyId, url },
    });
}

export async function getRandomReferral(companyId: number) {
    const referrals = await prisma.referral.findMany({
        where: { companyId },
    });

    if (referrals.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * referrals.length);
    return referrals[randomIndex];
}

export async function getAllReferrals(companyId: number) {
    return prisma.referral.findMany({
        where: { companyId },
    });
}

export async function getAllCompanies() {
    return prisma.company.findMany();
}

export async function getCompanyById(id: number) {
    return prisma.company.findUnique({ where: { id } });
}

export async function disconnectDatabase() {
    await prisma.$disconnect();
}
