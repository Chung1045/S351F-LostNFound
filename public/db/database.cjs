const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbFolder = path.join(__dirname, '..', 'db');
const dbPath = path.join(dbFolder, 'lost_and_found.db')

fs.mkdirSync(dbFolder, { recursive: true });

const db = new Database(dbPath, {
    // Leo: Temporarily commented out verbose logging since it was flooding the console with every SQL statement
    // verbose: console.log
});

let initialized = false;

const initDatabase = () => {
    if (initialized){
        return;
    }

    try {
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');

        db.exec(`    
            CREATE TABLE IF NOT EXISTS users (
                id           TEXT     PRIMARY KEY,
                username     TEXT     UNIQUE NOT NULL,
                email        TEXT     UNIQUE NOT NULL,
                password     TEXT     NOT NULL,
                role         TEXT     NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
                show_contact INTEGER  NOT NULL DEFAULT 1,
                created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        
            CREATE TABLE IF NOT EXISTS posts (
                id            TEXT     PRIMARY KEY,
                user_id       TEXT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type          TEXT     NOT NULL CHECK (type IN ('Lost', 'Found')),
                category      TEXT     NOT NULL,
                title         TEXT     NOT NULL,
                description   TEXT     NOT NULL,
                location      TEXT     NOT NULL,
                item_datetime DATETIME NOT NULL,
                contact_info  TEXT,
                status        TEXT     NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'collected', 'found')),
                created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        
            CREATE TRIGGER IF NOT EXISTS posts_updated_at
            AFTER UPDATE ON posts
            FOR EACH ROW
            BEGIN
                UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
            END;
        
            CREATE TABLE IF NOT EXISTS post_images (
                id        TEXT PRIMARY KEY,
                post_id   TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                image_url TEXT NOT NULL
            );
        
            CREATE TABLE IF NOT EXISTS report_categories (
                id   INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT    NOT NULL
            );
        
            CREATE TABLE IF NOT EXISTS comments (
                id         INTEGER  PRIMARY KEY AUTOINCREMENT,
                post_id    TEXT     NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                user_id    TEXT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content    TEXT     NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        
            CREATE TABLE IF NOT EXISTS notifications (
                id         INTEGER  PRIMARY KEY AUTOINCREMENT,
                user_id    TEXT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                sender_id  TEXT     REFERENCES users(id) ON DELETE SET NULL,
                type       TEXT     NOT NULL CHECK (type IN ('comment', 'status_update', 'system')),
                message    TEXT     NOT NULL,
                is_read    INTEGER  NOT NULL DEFAULT 0,
                link_id    TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        
            CREATE TABLE IF NOT EXISTS reports (
                id          TEXT    PRIMARY KEY,
                reporter_id TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                target_type TEXT    NOT NULL CHECK (target_type IN ('post', 'comment')),
                target_id   TEXT    NOT NULL,
                category_id INTEGER REFERENCES report_categories(id) ON DELETE SET NULL,
                reason      TEXT    NOT NULL,
                status      TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
                created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `)
        console.log("Database schema initialized successfully");
        
        // Create default admin user if it doesn't exist
        const adminEmail = 'admin@foundit.com';
        const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
        const adminUser = stmt.get(adminEmail);
        
        if (!adminUser) {
            const argon2 = require('argon2');
            const { v4: uuidv4 } = require('uuid');
            
            argon2.hash('admin123').then(hashedPassword => {
                const insertStmt = db.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)');
                insertStmt.run(uuidv4(), 'Admin Jane', adminEmail, hashedPassword, 'admin');
                console.log('Default admin user created: admin@foundit.com / admin123');
            }).catch(console.error);
        }

        initialized = true;
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
}

initDatabase();

module.exports = db;
