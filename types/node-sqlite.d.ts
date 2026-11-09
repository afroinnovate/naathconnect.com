declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }

  export interface StatementSync {
    get(...params: SqlValue[]): Record<string, SqlValue> | undefined;
    all(...params: SqlValue[]): Record<string, SqlValue>[];
    run(...params: SqlValue[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  }

  export type SqlValue = string | number | bigint | null | Uint8Array;
}
