/**
 * Backup Script
 * Creates full backup of database and uploaded files
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                  new Date().toTimeString().split(' ')[0].replace(/:/g, '');
const backupDir = path.join(__dirname, '../../data/backups');
const backupName = `mycontest_backup_${timestamp}`;

// Create backup directory if not exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

console.log('Starting backup process...');

// 1. Backup MySQL Database
console.log('1. Backing up MySQL database...');
const dbBackup = spawn('mysqldump', [
    '-u', process.env.MYSQL_USERNAME || 'root',
    `-p${process.env.MYSQL_PASSWORD || ''}`,
    process.env.MYSQL_DATABASE || 'my_contest'
]);

const dbBackupPath = path.join(backupDir, `${backupName}_db.sql`);
const dbStream = fs.createWriteStream(dbBackupPath);

dbBackup.stdout.pipe(dbStream);

dbBackup.on('error', (err) => {
    console.error('Database backup failed:', err.message);
    console.log('Tip: Make sure mysqldump is installed and accessible');
});

dbBackup.on('close', (code) => {
    if (code === 0) {
        console.log(`✓ Database backed up: ${dbBackupPath}`);

        // 2. Backup uploaded files
        console.log('2. Backing up uploaded files...');
        const zip = new AdmZip();

        const storagePath = path.join(__dirname, '../../data/storage');
        if (fs.existsSync(storagePath)) {
            zip.addLocalFolder(storagePath, 'storage');
        }

        const sessionPath = path.join(__dirname, '../session');
        if (fs.existsSync(sessionPath)) {
            zip.addLocalFolder(sessionPath, 'session');
        }

        // Add database backup to zip
        zip.addLocalFile(dbBackupPath, 'database');

        const zipPath = path.join(backupDir, `${backupName}.zip`);
        zip.writeZip(zipPath);

        console.log(`✓ Files backed up: ${zipPath}`);

        // 3. Cleanup standalone SQL file (already in ZIP)
        fs.unlinkSync(dbBackupPath);

        // 4. Summary
        console.log('\n======================');
        console.log('Backup completed successfully!');
        console.log(`Backup file: ${zipPath}`);
        console.log(`Size: ${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(2)} MB`);
        console.log('======================\n');

        // 5. Cleanup old backups (keep last 10)
        const backups = fs.readdirSync(backupDir)
            .filter(f => f.endsWith('.zip'))
            .map(f => ({
                name: f,
                path: path.join(backupDir, f),
                time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (backups.length > 10) {
            console.log('Cleaning up old backups (keeping last 10)...');
            backups.slice(10).forEach(backup => {
                fs.unlinkSync(backup.path);
                console.log(`Deleted: ${backup.name}`);
            });
        }

    } else {
        console.error('Database backup failed with code:', code);
    }
});
