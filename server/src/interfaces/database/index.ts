import { PrismaClient } from '@prisma/client';

export type txClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export interface IDatabase {
  client: PrismaClient | txClient;
}

export interface IContext {
  db: IDatabase;
}
