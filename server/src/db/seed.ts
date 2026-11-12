import { PrismaClient } from '@prisma/client';
import {
  initialDAOs,
  initialDelegates,
  initialProposals,
  initialVotes,
  initialRationales,
  initialScorecards,
  initialRewardPools,
} from './seedData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Turnout database seeding...');

  // 1. Seed DAOs
  for (const dao of initialDAOs) {
    await prisma.dAO.upsert({
      where: { daoId: dao.daoId },
      update: dao,
      create: dao,
    });
  }
  console.log(`✅ Seeded ${initialDAOs.length} DAOs`);

  // 2. Seed Delegates
  for (const del of initialDelegates) {
    await prisma.delegate.upsert({
      where: { accountId: del.accountId },
      update: del,
      create: del,
    });
  }
  console.log(`✅ Seeded ${initialDelegates.length} Delegates`);

  // 3. Seed Proposals
  for (const prop of initialProposals) {
    await prisma.proposal.upsert({
      where: {
        daoId_proposalId: {
          daoId: prop.daoId,
          proposalId: prop.proposalId,
        },
      },
      update: prop,
      create: prop,
    });
  }
  console.log(`✅ Seeded ${initialProposals.length} Proposals`);

  // 4. Seed Votes
  for (const vote of initialVotes) {
    await prisma.vote.upsert({
      where: {
        proposalId_delegateAccountId: {
          proposalId: vote.proposalId,
          delegateAccountId: vote.delegateAccountId,
        },
      },
      update: vote,
      create: vote,
    });
  }
  console.log(`✅ Seeded ${initialVotes.length} Votes`);

  // 5. Seed Rationales
  for (const rat of initialRationales) {
    await prisma.rationale.upsert({
      where: {
        proposalId_delegateAccountId: {
          proposalId: rat.proposalId,
          delegateAccountId: rat.delegateAccountId,
        },
      },
      update: rat,
      create: rat,
    });
  }
  console.log(`✅ Seeded ${initialRationales.length} Rationales`);

  // 6. Seed Scorecards
  for (const sc of initialScorecards) {
    await prisma.scorecard.upsert({
      where: {
        delegateAccountId_evaluationPeriod: {
          delegateAccountId: sc.delegateAccountId,
          evaluationPeriod: sc.evaluationPeriod,
        },
      },
      update: sc,
      create: sc,
    });
  }
  console.log(`✅ Seeded ${initialScorecards.length} Scorecards`);

  // 7. Seed Reward Pools
  for (const pool of initialRewardPools) {
    await prisma.rewardPool.upsert({
      where: { id: pool.id },
      update: pool,
      create: pool,
    });
  }
  console.log(`✅ Seeded ${initialRewardPools.length} Reward Pools`);

  console.log('✨ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

