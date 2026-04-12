import Database from 'better-sqlite3';
import path from 'path';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'abfall.db');

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function getDb(): Database.Database {
  if (!globalThis.__db) {
    globalThis.__db = new Database(DB_PATH);
    globalThis.__db.pragma('journal_mode = WAL');
    globalThis.__db.pragma('foreign_keys = ON');
    migrate(globalThis.__db);
  }
  return globalThis.__db;
}

export const db = getDb();

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      address     TEXT,
      postal_code TEXT,
      city        TEXT,
      country     TEXT NOT NULL DEFAULT 'DE',
      vat_id      TEXT,
      entsorgernummer TEXT,
      kontakt_email TEXT,
      kontakt_telefon TEXT,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      tenant_id     TEXT REFERENCES tenants(id) ON DELETE CASCADE,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      role          TEXT NOT NULL CHECK(role IN ('admin','tenant_admin','tenant_user')),
      is_active     INTEGER NOT NULL DEFAULT 1,
      last_login    TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

    CREATE TABLE IF NOT EXISTS abfall_eintraege (
      id                TEXT PRIMARY KEY,
      tenant_id         TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      avv_code          TEXT NOT NULL,
      bezeichnung       TEXT NOT NULL,
      menge             REAL NOT NULL,
      einheit           TEXT NOT NULL DEFAULT 'kg',
      erzeugungsdatum   TEXT NOT NULL,
      erzeuger_standort TEXT,
      entsorgungsweg    TEXT,
      entsorger_name    TEXT,
      status            TEXT NOT NULL DEFAULT 'offen'
                          CHECK(status IN ('offen','in_entsorgung','entsorgt','archiviert')),
      notizen           TEXT,
      created_by        TEXT NOT NULL REFERENCES users(id),
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_abfall_tenant ON abfall_eintraege(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_abfall_status ON abfall_eintraege(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_abfall_date   ON abfall_eintraege(tenant_id, erzeugungsdatum);

    CREATE TABLE IF NOT EXISTS entsorgungsnachweise (
      id                    TEXT PRIMARY KEY,
      tenant_id             TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      nachweis_nummer       TEXT NOT NULL,
      nachweis_typ          TEXT NOT NULL DEFAULT 'Entsorgungsnachweis',
      avv_code              TEXT,
      abfall_bezeichnung    TEXT NOT NULL,
      menge                 REAL,
      einheit               TEXT,
      erzeuger_name         TEXT NOT NULL,
      entsorger_name        TEXT NOT NULL,
      entsorger_genehmigung TEXT,
      befoerderer_name      TEXT,
      entsorgungsanlage     TEXT,
      ausstellungsdatum     TEXT NOT NULL,
      gueltig_bis           TEXT,
      status                TEXT NOT NULL DEFAULT 'aktiv'
                              CHECK(status IN ('aktiv','abgelaufen','widerrufen','archiviert')),
      notizen               TEXT,
      created_by            TEXT NOT NULL REFERENCES users(id),
      created_at            TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_nachweis_tenant  ON entsorgungsnachweise(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_nachweis_status  ON entsorgungsnachweise(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_nachweis_gueltig ON entsorgungsnachweise(gueltig_bis);

    CREATE TABLE IF NOT EXISTS dokumente (
      id           TEXT PRIMARY KEY,
      tenant_id    TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      dateiname    TEXT NOT NULL,
      speicherpfad TEXT NOT NULL,
      dateityp     TEXT NOT NULL,
      dateigroesse INTEGER NOT NULL,
      kategorie    TEXT NOT NULL DEFAULT 'sonstige',
      beschreibung TEXT,
      referenz_typ TEXT,
      referenz_id  TEXT,
      uploaded_by  TEXT NOT NULL REFERENCES users(id),
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_dokument_tenant ON dokumente(tenant_id);

    CREATE TABLE IF NOT EXISTS audit_log (
      id           TEXT PRIMARY KEY,
      tenant_id    TEXT REFERENCES tenants(id),
      user_id      TEXT NOT NULL,
      aktion       TEXT NOT NULL,
      ressource    TEXT NOT NULL,
      ressource_id TEXT,
      details      TEXT,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_log(tenant_id, created_at);
  `);

  // Seed admin user if none exists
  const adminExists = database.prepare(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`).get();
  if (!adminExists) {
    const adminId = nanoid();
    const hash = bcrypt.hashSync('admin123', 10);
    database.prepare(`
      INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role)
      VALUES (?, NULL, 'admin@abfallmanager.de', ?, 'System', 'Admin', 'admin')
    `).run(adminId, hash);

    // Create demo tenant
    const tenantId = nanoid();
    database.prepare(`
      INSERT INTO tenants (id, name, address, postal_code, city, kontakt_email, kontakt_telefon, entsorgernummer)
      VALUES (?, 'Musterbetrieb GmbH', 'Industriestraße 1', '12345', 'Musterstadt', 'kontakt@musterbetrieb.de', '0123-456789', 'DE-12345-Z')
    `).run(tenantId);

    const userId = nanoid();
    const userHash = bcrypt.hashSync('kunde123', 10);
    database.prepare(`
      INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role)
      VALUES (?, ?, 'max@musterbetrieb.de', ?, 'Max', 'Mustermann', 'tenant_admin')
    `).run(userId, tenantId, userHash);

    // Add demo waste entries
    const entries = [
      { avv: '20 01 01', bez: 'Papier und Pappe', menge: 450, einheit: 'kg', status: 'entsorgt', weg: 'Verwertung', entsorger: 'Papier Recycling GmbH', datum: '2024-01-15' },
      { avv: '20 03 01', bez: 'Gemischte Siedlungsabfälle', menge: 1200, einheit: 'kg', status: 'in_entsorgung', weg: 'Beseitigung', entsorger: 'Stadtwerke Entsorgung', datum: '2024-02-10' },
      { avv: '17 04 05', bez: 'Eisen und Stahl', menge: 750, einheit: 'kg', status: 'entsorgt', weg: 'Verwertung', entsorger: 'Metallhandel Müller', datum: '2024-02-20' },
      { avv: '15 01 01', bez: 'Papier- und Pappeverpackungen', menge: 320, einheit: 'kg', status: 'offen', weg: '', entsorger: '', datum: '2024-03-01' },
      { avv: '16 01 03*', bez: 'Altöl und Ölhaltiger Abfall', menge: 80, einheit: 'Liter', status: 'offen', weg: '', entsorger: '', datum: '2024-03-05' },
    ];

    for (const e of entries) {
      database.prepare(`
        INSERT INTO abfall_eintraege (id, tenant_id, avv_code, bezeichnung, menge, einheit, erzeugungsdatum, entsorgungsweg, entsorger_name, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(nanoid(), tenantId, e.avv, e.bez, e.menge, e.einheit, e.datum, e.weg, e.entsorger, e.status, userId);
    }
  }
}

// ─── Tenant queries ────────────────────────────────────────────────────────────

export function getAllTenants() {
  return db.prepare(`
    SELECT t.*,
      (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) as user_count,
      (SELECT COUNT(*) FROM abfall_eintraege a WHERE a.tenant_id = t.id) as entry_count
    FROM tenants t ORDER BY t.created_at DESC
  `).all() as Tenant[];
}

export function getTenantById(id: string) {
  return db.prepare(`SELECT * FROM tenants WHERE id = ?`).get(id) as Tenant | undefined;
}

export function createTenant(data: { name: string; address?: string; postal_code?: string; city?: string; kontakt_email?: string; kontakt_telefon?: string; entsorgernummer?: string; vat_id?: string }) {
  const id = nanoid();
  db.prepare(`
    INSERT INTO tenants (id, name, address, postal_code, city, kontakt_email, kontakt_telefon, entsorgernummer, vat_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.address || null, data.postal_code || null, data.city || null, data.kontakt_email || null, data.kontakt_telefon || null, data.entsorgernummer || null, data.vat_id || null);
  return id;
}

export function updateTenant(id: string, data: Partial<Tenant>) {
  db.prepare(`
    UPDATE tenants SET name=?, address=?, postal_code=?, city=?, kontakt_email=?, kontakt_telefon=?, entsorgernummer=?, vat_id=?, is_active=?, updated_at=datetime('now')
    WHERE id=?
  `).run(data.name, data.address, data.postal_code, data.city, data.kontakt_email, data.kontakt_telefon, data.entsorgernummer, data.vat_id, data.is_active ?? 1, id);
}

// ─── User queries ──────────────────────────────────────────────────────────────

export function getUserByEmail(email: string) {
  return db.prepare(`SELECT * FROM users WHERE email = ? AND is_active = 1`).get(email) as User | undefined;
}

export function getUserById(id: string) {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined;
}

export function getUsersByTenant(tenantId: string) {
  return db.prepare(`SELECT * FROM users WHERE tenant_id = ? ORDER BY created_at DESC`).all(tenantId) as User[];
}

export function createUser(data: { tenant_id: string | null; email: string; password: string; first_name: string; last_name: string; role: string }) {
  const id = nanoid();
  const hash = bcrypt.hashSync(data.password, 10);
  db.prepare(`
    INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.tenant_id, data.email, hash, data.first_name, data.last_name, data.role);
  return id;
}

export function updateUserLastLogin(id: string) {
  db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`).run(id);
}

// ─── Abfall queries ────────────────────────────────────────────────────────────

export interface AbfallFilter { status?: string; avv?: string; von?: string; bis?: string; page?: number; limit?: number }

export function getAbfallEintraege(tenantId: string, filter: AbfallFilter = {}) {
  const { status, avv, von, bis, page = 1, limit = 20 } = filter;
  const conditions: string[] = ['tenant_id = ?'];
  const params: unknown[] = [tenantId];

  if (status) { conditions.push('status = ?'); params.push(status); }
  if (avv) { conditions.push('avv_code LIKE ?'); params.push(`%${avv}%`); }
  if (von) { conditions.push('erzeugungsdatum >= ?'); params.push(von); }
  if (bis) { conditions.push('erzeugungsdatum <= ?'); params.push(bis); }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const items = db.prepare(`SELECT * FROM abfall_eintraege WHERE ${where} ORDER BY erzeugungsdatum DESC LIMIT ? OFFSET ?`).all([...params, limit, offset]);
  const total = (db.prepare(`SELECT COUNT(*) as cnt FROM abfall_eintraege WHERE ${where}`).get(params) as { cnt: number }).cnt;

  return { items, total, page, limit };
}

export function getAbfallEintragById(id: string, tenantId: string) {
  return db.prepare(`SELECT * FROM abfall_eintraege WHERE id = ? AND tenant_id = ?`).get(id, tenantId) as AbfallEintrag | undefined;
}

export function createAbfallEintrag(tenantId: string, userId: string, data: Partial<AbfallEintrag>) {
  const id = nanoid();
  db.prepare(`
    INSERT INTO abfall_eintraege (id, tenant_id, avv_code, bezeichnung, menge, einheit, erzeugungsdatum, erzeuger_standort, entsorgungsweg, entsorger_name, status, notizen, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenantId, data.avv_code, data.bezeichnung, data.menge, data.einheit || 'kg', data.erzeugungsdatum, data.erzeuger_standort || null, data.entsorgungsweg || null, data.entsorger_name || null, data.status || 'offen', data.notizen || null, userId);
  return id;
}

export function updateAbfallEintrag(id: string, tenantId: string, data: Partial<AbfallEintrag>) {
  db.prepare(`
    UPDATE abfall_eintraege SET avv_code=?, bezeichnung=?, menge=?, einheit=?, erzeugungsdatum=?, erzeuger_standort=?, entsorgungsweg=?, entsorger_name=?, status=?, notizen=?, updated_at=datetime('now')
    WHERE id=? AND tenant_id=?
  `).run(data.avv_code, data.bezeichnung, data.menge, data.einheit, data.erzeugungsdatum, data.erzeuger_standort || null, data.entsorgungsweg || null, data.entsorger_name || null, data.status, data.notizen || null, id, tenantId);
}

export function deleteAbfallEintrag(id: string, tenantId: string) {
  db.prepare(`UPDATE abfall_eintraege SET status='archiviert', updated_at=datetime('now') WHERE id=? AND tenant_id=?`).run(id, tenantId);
}

// ─── Entsorgungsnachweis queries ───────────────────────────────────────────────

export function getEntsorgungsnachweise(tenantId: string, filter: { status?: string; page?: number; limit?: number } = {}) {
  const { status, page = 1, limit = 20 } = filter;
  const conditions: string[] = ['tenant_id = ?'];
  const params: unknown[] = [tenantId];

  if (status) { conditions.push('status = ?'); params.push(status); }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const items = db.prepare(`SELECT * FROM entsorgungsnachweise WHERE ${where} ORDER BY ausstellungsdatum DESC LIMIT ? OFFSET ?`).all([...params, limit, offset]);
  const total = (db.prepare(`SELECT COUNT(*) as cnt FROM entsorgungsnachweise WHERE ${where}`).get(params) as { cnt: number }).cnt;

  return { items, total, page, limit };
}

export function getNachweisById(id: string, tenantId: string) {
  return db.prepare(`SELECT * FROM entsorgungsnachweise WHERE id=? AND tenant_id=?`).get(id, tenantId) as Entsorgungsnachweis | undefined;
}

export function createEntsorgungsnachweis(tenantId: string, userId: string, data: Partial<Entsorgungsnachweis>) {
  const id = nanoid();
  db.prepare(`
    INSERT INTO entsorgungsnachweise (id, tenant_id, nachweis_nummer, nachweis_typ, avv_code, abfall_bezeichnung, menge, einheit, erzeuger_name, entsorger_name, entsorger_genehmigung, befoerderer_name, entsorgungsanlage, ausstellungsdatum, gueltig_bis, status, notizen, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenantId, data.nachweis_nummer, data.nachweis_typ || 'Entsorgungsnachweis', data.avv_code || null, data.abfall_bezeichnung, data.menge || null, data.einheit || null, data.erzeuger_name, data.entsorger_name, data.entsorger_genehmigung || null, data.befoerderer_name || null, data.entsorgungsanlage || null, data.ausstellungsdatum, data.gueltig_bis || null, data.status || 'aktiv', data.notizen || null, userId);
  return id;
}

export function updateEntsorgungsnachweis(id: string, tenantId: string, data: Partial<Entsorgungsnachweis>) {
  db.prepare(`
    UPDATE entsorgungsnachweise SET nachweis_nummer=?, nachweis_typ=?, avv_code=?, abfall_bezeichnung=?, menge=?, einheit=?, erzeuger_name=?, entsorger_name=?, entsorger_genehmigung=?, befoerderer_name=?, entsorgungsanlage=?, ausstellungsdatum=?, gueltig_bis=?, status=?, notizen=?, updated_at=datetime('now')
    WHERE id=? AND tenant_id=?
  `).run(data.nachweis_nummer, data.nachweis_typ, data.avv_code || null, data.abfall_bezeichnung, data.menge || null, data.einheit || null, data.erzeuger_name, data.entsorger_name, data.entsorger_genehmigung || null, data.befoerderer_name || null, data.entsorgungsanlage || null, data.ausstellungsdatum, data.gueltig_bis || null, data.status, data.notizen || null, id, tenantId);
}

// ─── Dashboard stats ───────────────────────────────────────────────────────────

export function getDashboardStats(tenantId: string) {
  const total = (db.prepare(`SELECT COUNT(*) as cnt FROM abfall_eintraege WHERE tenant_id=? AND status != 'archiviert'`).get(tenantId) as { cnt: number }).cnt;
  const offen = (db.prepare(`SELECT COUNT(*) as cnt FROM abfall_eintraege WHERE tenant_id=? AND status='offen'`).get(tenantId) as { cnt: number }).cnt;
  const entsorgt = (db.prepare(`SELECT COUNT(*) as cnt FROM abfall_eintraege WHERE tenant_id=? AND status='entsorgt'`).get(tenantId) as { cnt: number }).cnt;
  const gesamtMenge = (db.prepare(`SELECT COALESCE(SUM(CASE WHEN einheit='t' THEN menge*1000 WHEN einheit='kg' THEN menge ELSE 0 END),0) as total FROM abfall_eintraege WHERE tenant_id=? AND status != 'archiviert'`).get(tenantId) as { total: number }).total;
  const aktiveNachweise = (db.prepare(`SELECT COUNT(*) as cnt FROM entsorgungsnachweise WHERE tenant_id=? AND status='aktiv'`).get(tenantId) as { cnt: number }).cnt;
  const ablaufendeNachweise = (db.prepare(`SELECT COUNT(*) as cnt FROM entsorgungsnachweise WHERE tenant_id=? AND status='aktiv' AND gueltig_bis BETWEEN date('now') AND date('now', '+60 days')`).get(tenantId) as { cnt: number }).cnt;

  const monatlich = db.prepare(`
    SELECT strftime('%Y-%m', erzeugungsdatum) as monat,
           SUM(CASE WHEN einheit='t' THEN menge*1000 WHEN einheit='kg' THEN menge ELSE 0 END) as menge_kg
    FROM abfall_eintraege WHERE tenant_id=? AND status != 'archiviert' AND erzeugungsdatum >= date('now', '-6 months')
    GROUP BY monat ORDER BY monat
  `).all(tenantId) as { monat: string; menge_kg: number }[];

  return { total, offen, entsorgt, gesamtMenge, aktiveNachweise, ablaufendeNachweise, monatlich };
}

export function getAdminStats() {
  const tenants = (db.prepare(`SELECT COUNT(*) as cnt FROM tenants WHERE is_active=1`).get() as { cnt: number }).cnt;
  const users = (db.prepare(`SELECT COUNT(*) as cnt FROM users WHERE role != 'admin'`).get() as { cnt: number }).cnt;
  const eintraege = (db.prepare(`SELECT COUNT(*) as cnt FROM abfall_eintraege`).get() as { cnt: number }).cnt;
  const nachweise = (db.prepare(`SELECT COUNT(*) as cnt FROM entsorgungsnachweise`).get() as { cnt: number }).cnt;
  return { tenants, users, eintraege, nachweise };
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country: string;
  vat_id?: string;
  entsorgernummer?: string;
  kontakt_email?: string;
  kontakt_telefon?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  user_count?: number;
  entry_count?: number;
}

export interface User {
  id: string;
  tenant_id: string | null;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'tenant_admin' | 'tenant_user';
  is_active: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AbfallEintrag {
  id: string;
  tenant_id: string;
  avv_code: string;
  bezeichnung: string;
  menge: number;
  einheit: string;
  erzeugungsdatum: string;
  erzeuger_standort?: string;
  entsorgungsweg?: string;
  entsorger_name?: string;
  status: string;
  notizen?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Entsorgungsnachweis {
  id: string;
  tenant_id: string;
  nachweis_nummer: string;
  nachweis_typ: string;
  avv_code?: string;
  abfall_bezeichnung: string;
  menge?: number;
  einheit?: string;
  erzeuger_name: string;
  entsorger_name: string;
  entsorger_genehmigung?: string;
  befoerderer_name?: string;
  entsorgungsanlage?: string;
  ausstellungsdatum: string;
  gueltig_bis?: string;
  status: string;
  notizen?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
