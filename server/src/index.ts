import { parseEnv } from 'env/index';
parseEnv();
import Server from 'apps/server';
import Database from 'apps/database';

const database = new Database();
const server = new Server(database);

server.start();
