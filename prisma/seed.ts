import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: './data/watttheref.db' });
const prisma = new PrismaClient({ adapter });

const companies = ['FrankEnergie', 'HomeWizard', 'Tesla', 'Tibber', 'Quatt', 'WeHeat'];

async function main() {
    console.log('Seeding companies...');

    for (const name of companies) {
        await prisma.company.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        console.log(`  - ${name}`);
    }

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
