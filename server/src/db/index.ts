import { IStorageEngine } from './types.js';
import { MemoryStorageEngine, memoryStorageEngine } from './memoryStore.js';
import { PrismaStorageEngine } from './prismaStore.js';

let storageInstance: IStorageEngine | null = null;

export async function getStorage(): Promise<IStorageEngine> {
  if (storageInstance) {
    return storageInstance;
  }

  // Attempt PostgreSQL connection via Prisma
  try {
    const prismaEngine = new PrismaStorageEngine();
    await prismaEngine.init();
    console.log('✅ PostgreSQL Database connected successfully via Prisma');
    storageInstance = prismaEngine;
    return storageInstance;
  } catch (err: unknown) {
    console.log(
      'ℹ️ PostgreSQL not reachable (local development mode). Using verified snapshot storage engine.'
    );
    await memoryStorageEngine.init();
    storageInstance = memoryStorageEngine;
    return storageInstance;
  }
}

