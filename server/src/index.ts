import { parseEnv } from 'env/index';
parseEnv();
import Server from 'apps/server';

const server = new Server();

server.start();
