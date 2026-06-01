import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { OracleResult } from './types';
import { supabase } from '../lib/supabase';

/**
 * THE MEMORY VAULT (dbService.ts) - Hybrid Evolution
 * Anchors cosmic revelations in local IndexedDB and synchronizes with the Supabase Cloud.
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

    private constructor() { }

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

/**
 * SECURE REVELATION: Saves to local vault and pushes to Supabase celestial storage.
 */
export const saveReading = async (reading: OracleResult): Promise<void> => {
    try {
        // 1. Local Anchor (IndexedDB)
        const db = await dbInstance.getConnection();
        await db.put(STORE_NAME, reading);
        console.log(`[Vault] Revelation ${reading.id} anchored locally.`);

        // 2. Cosmic Sync (Supabase)
        const { error } = await supabase.from('readings').upsert({
            id: reading.id,
            timestamp: reading.timestamp,
            archetype: reading.archetype,
            profile: reading.profile,
            gift: reading.gift,
            kin: reading.kin,
            totem: reading.totem,
            culture: reading.culture,
            user_image: reading.userImage,
            generated_image: reading.generatedImage,
            birth_data: reading.birthData,
            fingerprint: reading.fingerprint,
            cosmic_readings: reading.cosmicReadings,
            mythopoetic_brief: reading.mythopoeticBrief
        });

        if (error) {
            console.warn("[Cloud] Sync delayed:", error.message);
        } else {
            console.log(`[Cloud] Revelation ${reading.id} mirrored in the stars.`);
        }
    } catch (error) {
        console.error("Vaulting Error:", error);
    }
};

/**
 * RECONCILE HISTORY: Pulls from local vault and checks for cloud updates.
 */
export const getAllReadings = async (): Promise<OracleResult[]> => {
    try {
        // 1. Get Local Readings
        const db = await dbInstance.getConnection();
        const localReadings = await db.getAllFromIndex(STORE_NAME, 'by-date');

        // 2. Attempt Cloud Reconcile
        const { data: cloudReadings, error } = await supabase
            .from('readings')
            .select('*')
            .order('timestamp', { ascending: true });

        if (error) {
            console.warn("[Cloud] Could not reach celestial records. Using local vault.");
            return localReadings;
        }

        if (cloudReadings && cloudReadings.length > 0) {
            // Map Supabase snake_case/jsonb fields back to OracleResult structure
            const mappedCloud: OracleResult[] = cloudReadings.map(r => ({
                id: r.id,
                timestamp: r.timestamp,
                birthData: r.birth_data,
                fingerprint: r.fingerprint,
                archetype: r.archetype,
                profile: r.profile,
                gift: r.gift,
                kin: r.kin,
                totem: r.totem,
                cosmicReadings: r.cosmic_readings,
                mythopoeticBrief: r.mythopoetic_brief,
                generatedImage: r.generated_image,
                userImage: r.user_image,
                culture: r.culture
            }));

            // Optional: Update local cache with missing cloud readings
            for (const cr of mappedCloud) {
                if (!localReadings.find(lr => lr.id === cr.id)) {
                    await db.put(STORE_NAME, cr);
                }
            }
            return mappedCloud;
        }

        return localReadings;
    } catch (error) {
        console.error("History Retrieval Error:", error);
        return [];
    }
};

export const deleteReading = async (id: string): Promise<void> => {
    try {
        const db = await dbInstance.getConnection();
        await db.delete(STORE_NAME, id);

        await supabase.from('readings').delete().eq('id', id);

        console.log(`[Vault] Revelation ${id} purged from all records.`);
    } catch (error) {
        console.error("Purge Error:", error);
    }
};