import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { OracleResult } from './types';

/**
 * THE MEMORY VAULT (dbService.ts) - Hybrid Edition
 * Uses a Singleton Pattern for industrial-grade stability.
 */

interface OracleDB extends DBSchema {
  readings: {
    key: string;
    value: OracleResult;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'mythic-oracle-db';
const STORE_NAME = 'readings';

class DatabaseSingleton {
    private static instance: DatabaseSingleton;
    private dbPromise: Promise<IDBPDatabase<OracleDB>> | null = null;
    
    private constructor() {}
    
    public static getInstance(): DatabaseSingleton {
        if (!DatabaseSingleton.instance) {
            DatabaseSingleton.instance = new DatabaseSingleton();
        }
        return DatabaseSingleton.instance;
    }

    private _init(): Promise<IDBPDatabase<OracleDB>> {
        return openDB<OracleDB>(DB_NAME, 1, {
            upgrade(db: IDBPDatabase<OracleDB>) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('by-date', 'timestamp');
                }
            },
            terminated: () => {
                console.warn('Vault connection lost. Resetting...');
                this.dbPromise = null;
            }
        });
    }

    public async getConnection(): Promise<IDBPDatabase<OracleDB>> {
        if (!this.dbPromise) {
            this.dbPromise = this._init();
        }
        try {
            return await this.dbPromise;
        } catch (e) {
            this.dbPromise = null;
            return this.getConnection();
        }
    }
}

const dbInstance = DatabaseSingleton.getInstance();

// Function name aligned with App.tsx
export const saveReading = async (reading: OracleResult): Promise<void> => {
    try {
        const db = await dbInstance.getConnection();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await tx.store.put(reading);
        await tx.done;
        console.log(`[Vault] Revelation ${reading.id} secured.`);
    } catch (error) {
        console.error("Vaulting Error:", error);
    }
};

// Function name aligned for future History components
export const getAllReadings = async (): Promise<OracleResult[]> => {
    try {
        const db = await dbInstance.getConnection();
        return await db.getAllFromIndex(STORE_NAME, 'by-date');
    } catch (error) {
        console.error("History Retrieval Error:", error);
        return [];
    }
};

export const deleteReading = async (id: string): Promise<void> => {
    const db = await dbInstance.getConnection();
    await db.delete(STORE_NAME, id);
};