export type SyncResolution = 'apply' | 'conflict' | 'skip';

/**
 * Resolves conflict based on Last Write Wins (LWW) resolution strategy.
 * - Returns 'apply' if the incoming edit is strictly newer.
 * - Returns 'conflict' if the timestamps are exactly equal (tie).
 * - Returns 'skip' if the existing database note is strictly newer.
 */
export const resolveSyncLWW = (incomingTimestamp: number, existingUpdatedAt: Date): SyncResolution => {
  const existingTime = existingUpdatedAt.getTime();
  if (incomingTimestamp > existingTime) {
    return 'apply';
  }
  if (incomingTimestamp === existingTime) {
    return 'conflict';
  }
  return 'skip';
};
