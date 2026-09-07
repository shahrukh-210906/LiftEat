const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execFileAsync = util.promisify(execFile);

const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');

async function runBackupAndVerify() {
  if (!DB_URI) {
    console.error('[Backup] Skipped: No MongoDB URI provided.');
    return;
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(BACKUP_DIR, `backup-${timestamp}.gzip`);

  try {
    console.log(`[Backup] Starting mongodump to ${archivePath}...`);

    // 1. Create the backup
    await execFileAsync('mongodump', ['--uri', DB_URI, '--archive', archivePath, '--gzip'], { windowsHide: true });
    console.log('[Backup] Dump successful. Commencing restore check...');

    // 2. Perform a dry-run restore check
    await execFileAsync('mongorestore', ['--uri', DB_URI, '--archive', archivePath, '--gzip', '--dryRun'], { windowsHide: true });
    console.log('[Backup] Restore check passed. Archive is healthy.');

    // 3. Retention Policy: Keep only the last 7 backups
    cleanupOldBackups(7);

  } catch (error) {
    if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
    console.error(`[Backup] Backup or verification failed (${error.code || 'unknown error'}).`);
    throw new Error('Database backup or verification failed');
  }
}

function cleanupOldBackups(keepCount) {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-') && f.endsWith('.gzip'))
    .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);

  if (files.length > keepCount) {
    const toDelete = files.slice(keepCount);
    toDelete.forEach(file => {
      fs.unlinkSync(path.join(BACKUP_DIR, file.name));
      console.log(`[Backup] Deleted old archive: ${file.name}`);
    });
  }
}

if (require.main === module) {
  runBackupAndVerify();
}

module.exports = runBackupAndVerify;
