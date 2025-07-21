const Database = require('better-sqlite3');
const db = new Database('database.db');

try {
    db.exec("ALTER TABLE professionals ADD COLUMN password TEXT");
    console.log('✅ Coluna "password" adicionada com sucesso à tabela "professionals".');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Coluna "password" já existe. Nenhuma alteração necessária.');
    } else {
        console.error('Erro ao adicionar coluna:', error);
    }
}

db.close();