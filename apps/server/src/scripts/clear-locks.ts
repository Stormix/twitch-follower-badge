import db from '@/lib/db';
import mainLogger from '@/lib/logger';
import { sql } from 'drizzle-orm';

const logger = mainLogger.getSubLogger({ name: 'clearLocks' });

/**
 * Script to clear all PostgreSQL advisory locks
 * This is useful for resetting the state after a crash or during development
 */
async function clearAllLocks() {
  try {
    logger.info('Starting to clear all advisory locks...');

    // Get current locks with more details
    const locksResult = await db.execute(
      sql`SELECT l.locktype, l.objid, l.mode, l.pid, 
          pg_blocking_pids(l.pid) as blocked_by,
          a.application_name, a.client_addr, a.usename, a.state
          FROM pg_locks l
          JOIN pg_stat_activity a ON l.pid = a.pid
          WHERE l.locktype = 'advisory'`,
    );

    const lockCount = locksResult.rows.length;
    logger.info(`Found ${lockCount} advisory locks`);

    if (lockCount === 0) {
      logger.info('No locks to clear');
      return;
    }

    // Log details about the locks
    logger.info('Lock details:');
    locksResult.rows.forEach((lock, index) => {
      logger.info(
        `Lock ${index + 1}: objid=${lock.objid}, pid=${lock.pid}, user=${lock.usename}, app=${lock.application_name}`,
      );
    });

    // Clear locks for current session
    await db.execute(sql`SELECT pg_advisory_unlock_all()`);
    logger.info('Cleared advisory locks for current session');

    // For locks held by other sessions, we need to terminate those sessions
    // WARNING: This is a drastic measure and should only be used in development
    logger.warn('Attempting to terminate other sessions holding locks...');

    // Group by PID to avoid terminating the same session multiple times
    const pids = [...new Set(locksResult.rows.map((row) => row.pid))];

    for (const pid of pids) {
      try {
        // Skip our own session
        const ownPid = await db.execute(sql`SELECT pg_backend_pid()`);
        if (pid === ownPid.rows[0].pg_backend_pid) {
          logger.info(`Skipping own session (PID: ${pid})`);
          continue;
        }

        logger.info(`Terminating session with PID: ${pid}`);
        await db.execute(sql`SELECT pg_terminate_backend(${pid})`);
      } catch (err) {
        logger.error(`Failed to terminate session ${pid}:`, err);
      }
    }

    // Verify locks are cleared
    const verifyResult = await db.execute(sql`SELECT objid FROM pg_locks WHERE locktype = 'advisory'`);

    if (verifyResult.rows.length === 0) {
      logger.info('Verified: No advisory locks remaining');
    } else {
      logger.warn(`Warning: ${verifyResult.rows.length} locks still remain`);
      logger.warn('You may need to restart the database server to clear all locks');
    }
  } catch (error) {
    logger.error('Error clearing advisory locks:', error);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  clearAllLocks()
    .then(() => {
      logger.info('Lock clearing process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Lock clearing process failed:', error);
      process.exit(1);
    });
}

export default clearAllLocks;
