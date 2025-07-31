// add_portfolio_table.js
const Database = require('better-sqlite3');
const db = new Database('database.db');

try {
    const createPortfolioTableSql = `
        CREATE TABLE IF NOT EXISTS portfolio_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            professional_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            caption TEXT,
            uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (professional_id) REFERENCES professionals (id) ON DELETE CASCADE
        )
    `;
    db.exec(createPortfolioTableSql);
    console.log('✅ Tabela "portfolio_images" criada ou já existente.');
} catch (error) {
    console.error('Erro ao criar a tabela "portfolio_images":', error);
}

db.close();