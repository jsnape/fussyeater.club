import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import type { DbLike, DbPrepared, DbResult, DbRunResult } from './db';

class PreparedStatement implements DbPrepared {
    private values: unknown[] = [];

    constructor(
        private readonly db: DatabaseSync,
        private readonly query: string
    ) {}

    bind(...values: unknown[]): DbPrepared {
        this.values = values;
        return this;
    }

    async run<T = Record<string, unknown>>(): Promise<DbResult<T>> {
        const statement = this.db.prepare(this.query);
        const result = statement.run(...(this.values as never[]));
        return {
            success: true,
            meta: { changes: Number(result.changes) }
        };
    }

    async all<T = Record<string, unknown>>(): Promise<DbResult<T>> {
        const statement = this.db.prepare(this.query);
        const results = statement.all(...(this.values as never[])) as T[];
        return { success: true, results };
    }

    async first<T = Record<string, unknown>>(): Promise<T | null> {
        const statement = this.db.prepare(this.query);
        const row = statement.get(...(this.values as never[])) as T | undefined;
        return row ?? null;
    }
}

class SqliteDbAdapter implements DbLike {
    constructor(private readonly db: DatabaseSync) {}

    prepare(query: string): DbPrepared {
        return new PreparedStatement(this.db, query);
    }

    async exec(query: string): Promise<DbRunResult> {
        this.db.exec(query);
        return { success: true };
    }

    close(): void {
        this.db.close();
    }
}

export type TestDbPair = {
    first: SqliteDbAdapter;
    second: SqliteDbAdapter;
    cleanup: () => void;
};

export function createTestDbPair(): TestDbPair {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'fussyeater-db-'));
    const databasePath = join(tempDirectory, 'test.sqlite');
    const migrationPath = join(process.cwd(), 'migrations/0001_registration_household_invites.sql');
    const migration = readFileSync(migrationPath, 'utf8');

    const firstRaw = new DatabaseSync(databasePath);
    const secondRaw = new DatabaseSync(databasePath);
    firstRaw.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 2000;');
    secondRaw.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 2000;');
    firstRaw.exec(migration);

    return {
        first: new SqliteDbAdapter(firstRaw),
        second: new SqliteDbAdapter(secondRaw),
        cleanup: () => {
            firstRaw.close();
            secondRaw.close();
            rmSync(tempDirectory, { recursive: true, force: true });
        }
    };
}
