import { Database } from "bun:sqlite";
import { mkdirSync, existsSync, readdirSync, unlinkSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { env } from "../src/config/env";

/**
 * Robust automated SQLite backup script using native VACUUM INTO.
 * Safe to run concurrently with active WAL transactions.
 */
function runBackup() {
  const dbPath = env.DATABASE_PATH;

  if (!existsSync(dbPath)) {
    console.error(`[BACKUP ERROR] No se encontró el archivo de base de datos en: ${dbPath}`);
    process.exit(1);
  }

  // Backup folder inside the persistent data directory (/app/data/backups)
  const baseDataDir = dirname(dbPath);
  const backupsDir = join(baseDataDir, "backups");
  mkdirSync(backupsDir, { recursive: true });

  // Format filename with local timestamp: backup_YYYY-MM-DD_HH-mm-ss.sqlite
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const backupFilename = `backup_${timestamp}.sqlite`;
  const backupFilePath = join(backupsDir, backupFilename);

  console.log(`[BACKUP] Iniciando respaldo de '${dbPath}' hacia '${backupFilePath}'...`);

  try {
    const db = new Database(dbPath, { readonly: true });
    // VACUUM INTO creates a vacuumed, defragmented and consistent backup snapshot
    db.run(`VACUUM INTO ?;`, [backupFilePath]);
    db.close();

    const stat = statSync(backupFilePath);
    const sizeKb = (stat.size / 1024).toFixed(1);
    console.log(`[BACKUP SUCCESS] Respaldo generado correctamente (${sizeKb} KB): ${backupFilename}`);

    // Retention policy: Keep the last 15 backups to prevent disk overflow
    cleanOldBackups(backupsDir, 15);
  } catch (err) {
    console.error(`[BACKUP FAILED] Error al generar el respaldo:`, err);
    process.exit(1);
  }
}

function cleanOldBackups(directory: string, maxKeep: number) {
  try {
    const files = readdirSync(directory)
      .filter((file) => file.startsWith("backup_") && file.endsWith(".sqlite"))
      .map((file) => {
        const filePath = join(directory, file);
        return {
          name: file,
          path: filePath,
          time: statSync(filePath).mtimeMs,
        };
      })
      .sort((a, b) => b.time - a.time); // Newest first

    if (files.length > maxKeep) {
      const toDelete = files.slice(maxKeep);
      console.log(`[BACKUP CLEANUP] Eliminando ${toDelete.length} respaldos antiguos...`);
      for (const item of toDelete) {
        unlinkSync(item.path);
        console.log(`  - Eliminado: ${item.name}`);
      }
    }
  } catch (cleanupErr) {
    console.warn(`[BACKUP CLEANUP WARNING] No se pudo depurar respaldos antiguos:`, cleanupErr);
  }
}

runBackup();
