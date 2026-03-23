import Dexie, { Table } from 'dexie';
import { OfflineRequest } from '../types';

class CarWashDb extends Dexie {
  queue!: Table<OfflineRequest, number>;

  constructor() {
    super('car-wash-operations');
    this.version(1).stores({
      queue: '++id, url, createdAt'
    });
  }
}

export const offlineDb = new CarWashDb();
