const Database = require('better-sqlite3');
const db = new Database('database.db');

try {
    db.exec("ALTER TABLE professionals ADD COLUMN bairro TEXT");
    console.log('✅ Coluna "bairro" adicionada com sucesso!');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Coluna "bairro" já existe.');
    } else {
        console.error('Erro ao adicionar coluna:', error);
    }
}
db.close();