#!/usr/bin/env bash
# ==============================================================================
# Script Backup Database — Perpustakaan Jalanan Blora (Perpusjal v3)
# ==============================================================================
# Menghasilkan snapshot terkompresi (gzip) dari PostgreSQL schema dan data.
# Mempertahankan 7 backup harian terakhir dan otomatis membersihkan backup usang.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
TARGET_FILE="$BACKUP_DIR/perpusjal_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Memuat DATABASE_URL dari .env jika ada
if [ -f "$ROOT_DIR/.env" ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "$ROOT_DIR/.env" | grep -E '^DATABASE_URL=' | xargs)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ Error: Variabel DATABASE_URL tidak ditemukan di .env atau environment." >&2
  exit 1
fi

echo "📦 [Perpusjal Backup] Memulai backup database PostgreSQL..."
echo "🕒 Waktu: $(date)"
echo "📁 Direktori: $BACKUP_DIR"

if command -v pg_dump >/dev/null 2>&1; then
  pg_dump "$DATABASE_URL" | gzip -9 > "$TARGET_FILE"
  FILE_SIZE="$(du -h "$TARGET_FILE" | cut -f1)"
  echo "✅ [Perpusjal Backup] Sukses membuat backup: $TARGET_FILE ($FILE_SIZE)"
else
  echo "⚠️ 'pg_dump' tidak ditemukan di sistem host. Mencoba backup via container docker..."
  if docker ps --format '{{.Names}}' | grep -q "perpusjal-postgres"; then
    docker exec perpusjal-postgres pg_dump -U postgres perpusjal_db | gzip -9 > "$TARGET_FILE"
    FILE_SIZE="$(du -h "$TARGET_FILE" | cut -f1)"
    echo "✅ [Perpusjal Backup] Sukses membuat backup via Docker: $TARGET_FILE ($FILE_SIZE)"
  else
    echo "❌ Error: Tidak dapat mengeksekusi pg_dump (pg_dump tidak terpasang dan container docker tidak aktif)." >&2
    exit 1
  fi
fi

# Rotasi backup: Hapus backup yang lebih tua dari 7 hari
echo "🧹 Membersihkan backup usang (retensi: 7 hari)..."
find "$BACKUP_DIR" -name "perpusjal_backup_*.sql.gz" -mtime +7 -exec rm -f {} \;

echo "🎉 Backup selesai dengan aman."
