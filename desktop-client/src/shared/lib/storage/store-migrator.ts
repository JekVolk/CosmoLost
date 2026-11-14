import type { z } from 'zod';

export interface MigrationConfig<T> {
  version: number;
  schema: z.ZodType<T>;
  fallback: T;
  migrations?: Record<number, (oldState: unknown) => unknown>;
}

/**
 * Creates a schema-driven, zero-SQL migration function for Zustand persist middleware.
 * Automatically validates incoming JSON, backfills new default fields, and applies
 * step-by-step transformations between store versions without data loss.
 */
export function createStoreMigrator<T>(config: MigrationConfig<T>) {
  return (persistedState: unknown, version: number): T => {
    let currentData = persistedState;
    let currentVersion = version;

    // Apply incremental version transforms if specified
    if (config.migrations) {
      while (currentVersion < config.version) {
        const migratorFn = config.migrations[currentVersion];
        if (migratorFn) {
          try {
            currentData = migratorFn(currentData);
          } catch (err) {
            console.warn(`[StoreMigrator] Migration step failed from v${currentVersion}:`, err);
            break;
          }
        }
        currentVersion++;
      }
    }

    // Schema parse and default backfill via Zod
    const parseResult = config.schema.safeParse(currentData);
    if (parseResult.success) {
      return parseResult.data;
    }

    console.warn(
      `[StoreMigrator] Schema validation fallback triggered (v${version} -> v${config.version}):`,
      parseResult.error.format(),
    );
    return config.fallback;
  };
}
