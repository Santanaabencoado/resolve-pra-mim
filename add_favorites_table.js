// add_favorites_table.js
const Database = require('better-sqlite3');
const db = new Database('database.db');

try {
    const createFavoritesTableSql = `
        CREATE TABLE IF NOT EXISTS favorites (
            client_id INTEGER NOT NULL,
            professional_id INTEGER NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (client_id, professional_id),
            FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
            FOREIGN KEY (professional_id) REFERENCES professionals (id) ON DELETE CASCADE
        )
    `;
    db.exec(createFavoritesTableSql);
    console.log('✅ Tabela "favorites" criada ou já existente.');
} catch (error) {
    console.error('Erro ao criar a tabela "favorites":', error);
}

db.close();