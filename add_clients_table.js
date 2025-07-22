const Database = require('better-sqlite3');
const db = new Database('database.db');

try {
    const createClientsTableSql = `
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.exec(createClientsTableSql);
    console.log('✅ Tabela "clients" criada ou já existente.');
} catch (error) {
    console.error('Erro ao criar a tabela "clients":', error);
}

db.close();