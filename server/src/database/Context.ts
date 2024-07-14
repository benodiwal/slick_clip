import { IContext, IDatabase } from 'interfaces/database';

export default class Context implements IContext {
  db: IDatabase;
  constructor(database: IDatabase) {
    this.db = database;
  }
}
