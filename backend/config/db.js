const mysql = require("mysql2");
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let isMySqlConnected = false;
let realPool = null;
let sqlJsDb = null;

const SQLITE_FILE = path.join(__dirname, "..", "database", "helpdesk_db.sqlite");

// Try creating MySQL pool
try {
    realPool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "helpdesk_db",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true
    });

    realPool.getConnection((err, connection) => {
        if (err) {
            console.warn("[MySQL] Connection failed (" + (err.code || err.message) + "). Engaging relational fallback engine.");
            isMySqlConnected = false;
            initFallbackDb();
            return;
        }
        isMySqlConnected = true;
        console.log("MySQL database connected successfully!");
        connection.release();
    });
} catch (err) {
    console.warn("[MySQL] Pool initialization failed. Using relational fallback engine.");
    initFallbackDb();
}

function adaptSql(sql) {
    return sql
        .replace(/--[^\n]*/g, '')
        .replace(/CREATE DATABASE[^\n;]+;/gi, '')
        .replace(/USE [^\n;]+;/gi, '')
        .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/ON UPDATE CURRENT_TIMESTAMP/gi, '')
        .replace(/ON DUPLICATE KEY UPDATE[^;\n]+/gi, '')
        .replace(/DATE_ADD\(NOW\(\), INTERVAL (\d+) HOUR\)/gi, "datetime('now', '+$1 hours')")
        .replace(/DATE_SUB\(NOW\(\), INTERVAL (\d+) HOUR\)/gi, "datetime('now', '-$1 hours')")
        .replace(/DATE_SUB\(NOW\(\), INTERVAL (\d+) MINUTE\)/gi, "datetime('now', '-$1 minutes')")
        .replace(/DATE_SUB\(NOW\(\), INTERVAL (\d+) DAY\)/gi, "datetime('now', '-$1 days')")
        .replace(/NOW\(\)/gi, "datetime('now')");
}

function saveDb() {
    try {
        if (sqlJsDb) {
            const data = sqlJsDb.export();
            const dir = path.dirname(SQLITE_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(SQLITE_FILE, Buffer.from(data));
        }
    } catch (e) {
        console.error("[Fallback DB Save Error]", e.message);
    }
}

async function initFallbackDb() {
    if (sqlJsDb) return;
    try {
        const SQL = await initSqlJs();
        if (fs.existsSync(SQLITE_FILE)) {
            const buffer = fs.readFileSync(SQLITE_FILE);
            sqlJsDb = new SQL.Database(buffer);
            console.log("[Relational DB] Loaded existing helpdesk_db database from disk.");
        } else {
            sqlJsDb = new SQL.Database();
            console.log("[Relational DB] Initializing fresh schema & seed data...");
            const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
            const seedPath = path.join(__dirname, "..", "database", "seed.sql");

            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, "utf8");
                const stmts = adaptSql(schemaSql).split(";").map(s => s.trim()).filter(Boolean);
                for (const s of stmts) {
                    try { sqlJsDb.run(s + ";"); } catch (e) {}
                }
            }

            if (fs.existsSync(seedPath)) {
                const seedSql = fs.readFileSync(seedPath, "utf8");
                const stmts = adaptSql(seedSql).split(";").map(s => s.trim()).filter(Boolean);
                for (const s of stmts) {
                    try { sqlJsDb.run(s + ";"); } catch (e) {}
                }
            }
            saveDb();
            console.log("[Relational DB] All tables and sample data initialized successfully!");
        }
    } catch (err) {
        console.error("[Relational DB Init Error]", err);
    }
}

function runSqlJsQuery(sql, params) {
    if (!sqlJsDb) throw new Error("Database not ready");
    let trimmed = sql.trim();
    trimmed = trimmed.replace(/\bNOW\(\)/gi, "datetime('now')");

    const isSelect = trimmed.toUpperCase().startsWith("SELECT") || trimmed.toUpperCase().startsWith("WITH") || trimmed.toUpperCase().startsWith("PRAGMA");

    if (isSelect) {
        const stmt = sqlJsDb.prepare(trimmed);
        if (params && params.length > 0) stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    } else {
        const stmt = sqlJsDb.prepare(trimmed);
        if (params && params.length > 0) stmt.bind(params);
        stmt.step();
        stmt.free();

        const lastIdRes = sqlJsDb.exec("SELECT last_insert_rowid() AS id, changes() AS affected;");
        let insertId = 0;
        let affectedRows = 0;
        if (lastIdRes && lastIdRes.length > 0 && lastIdRes[0].values.length > 0) {
            insertId = lastIdRes[0].values[0][0];
            affectedRows = lastIdRes[0].values[0][1];
        }
        saveDb();
        return { insertId, affectedRows };
    }
}

// Unified wrapper supporting callbacks, getConnection, and promise()
const db = {
    query(sql, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }

        if (isMySqlConnected && realPool) {
            return realPool.query(sql, params, callback);
        }

        // Use fallback engine
        try {
            if (!sqlJsDb) {
                initFallbackDb().then(() => {
                    const res = runSqlJsQuery(sql, params);
                    if (callback) callback(null, res);
                }).catch(err => {
                    if (callback) callback(err);
                });
                return;
            }
            const res = runSqlJsQuery(sql, params);
            if (callback) callback(null, res);
        } catch (err) {
            if (callback) callback(err);
            else console.error("[Query Error]", err);
        }
    },

    getConnection(callback) {
        if (isMySqlConnected && realPool) {
            return realPool.getConnection(callback);
        }

        // Mock connection for transactions
        const connection = {
            query: (sql, params, cb) => {
                db.query(sql, params, cb);
            },
            beginTransaction: (cb) => {
                if (cb) cb(null);
            },
            commit: (cb) => {
                saveDb();
                if (cb) cb(null);
            },
            rollback: (cb) => {
                if (cb) cb(null);
            },
            release: () => {}
        };
        callback(null, connection);
    },

    promise() {
        return {
            query: (sql, params) => {
                if (isMySqlConnected && realPool) {
                    return realPool.promise().query(sql, params);
                }

                return new Promise((resolve, reject) => {
                    try {
                        if (!sqlJsDb) {
                            initFallbackDb().then(() => {
                                const rows = runSqlJsQuery(sql, params);
                                resolve([rows, []]);
                            }).catch(reject);
                        } else {
                            const rows = runSqlJsQuery(sql, params);
                            resolve([rows, []]);
                        }
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        };
    }
};

module.exports = db;
