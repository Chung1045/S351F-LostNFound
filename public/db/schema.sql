PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id           TEXT     PRIMARY KEY,
    username     TEXT     UNIQUE NOT NULL,
    email        TEXT     UNIQUE NOT NULL,
    password     TEXT     NOT NULL,
    role         TEXT     NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin')),
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
    status        TEXT     NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'collected', 'found')),
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
    id   INTEGER PRIMARY KEY,
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
    type       TEXT     NOT NULL
    CHECK (type IN ('comment', 'status_update', 'system')),
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
    status      TEXT    NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);