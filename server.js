// --- 1. IMPORTAÇÕES ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Database = require('better-sqlite3');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { MercadoPagoConfig, Preference, Payment, MerchantOrder } = require('mercadopago');
const bcrypt = require('bcrypt');

// --- 2. CONFIGURAÇÕES INICIAIS ---
const app = express();
const PORT = 3000;
const db = new Database('database.db');
const ADMIN_PASSWORD = "resolve123";

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

// --- 3. BANCO DE DADOS ---
const createProfessionalsTableSql = `
    CREATE TABLE IF NOT EXISTS professionals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        birthDate TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        cep TEXT,
        address TEXT,
        serviceType TEXT,
        cnpj TEXT,
        experience INTEGER,
        paymentMethods TEXT,
        bio TEXT,
        profilePic TEXT,
        docPhoto TEXT,
        selfie TEXT,
        status TEXT DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        password TEXT
    )
`;
db.exec(createProfessionalsTableSql);

const createReviewsTableSql = `
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professional_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        client_name TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES professionals (id)
    )
`;
db.exec(createReviewsTableSql);
console.log('Tabelas "professionals" e "reviews" prontas para uso.');


// --- 4. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(session({
    secret: 'resolve-pra-mim-segredo-super-forte',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

const checkAuth = (req, res, next) => {
    if (req.session.isLoggedIn) { next(); } else { res.redirect('/login.html'); }
};

const checkProfessionalAuth = (req, res, next) => {
    if (req.session.isProfessionalLoggedIn && req.session.professionalId) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Acesso não autorizado. Por favor, faça o login.' });
    }
};

// --- 5. ROTAS DA APLICAÇÃO ---

// --- ROTAS PÚBLICAS E DE PROFISSIONAIS ---

app.post('/api/register-professional', upload.fields([
    { name: 'profilePic', maxCount: 1 }, { name: 'docPhoto', maxCount: 1 }, { name: 'selfie', maxCount: 1 }
]), async (req, res) => { 
    const { fullName, cpf, birthDate, email, phone, cep, address, serviceType, cnpj, experience, bio, password } = req.body;
    if (!fullName || !cpf || !password) {
        return res.status(400).json({ success: false, message: 'Nome, CPF e Senha são obrigatórios.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        let paymentMethods = req.body.payment || [];
        const paymentMethodsString = (Array.isArray(paymentMethods) ? paymentMethods : [paymentMethods]).join(',');
        const profilePicPath = req.files.profilePic ? req.files.profilePic[0].path : null;
        const docPhotoPath = req.files.docPhoto ? req.files.docPhoto[0].path : null;
        const selfiePath = req.files.selfie ? req.files.selfie[0].path : null;
        const insertSql = `
            INSERT INTO professionals (
                fullName, cpf, birthDate, email, phone, cep, bairro, address, serviceType, cnpj, 
                experience, bio, paymentMethods, password, profilePic, docPhoto, selfie
            ) VALUES (
                @fullName, @cpf, @birthDate, @email, @phone, @cep, @bairro, @address, @serviceType, @cnpj, 
                @experience, @bio, @paymentMethods, @password, @profilePic, @docPhoto, @selfie
            )`;
        const stmt = db.prepare(insertSql);
        stmt.run({
            fullName, cpf, birthDate, email, phone, cep, bairro, address, serviceType, cnpj, 
            experience, bio, paymentMethods: paymentMethodsString, 
            password: hashedPassword, 
            profilePic: profilePicPath, docPhoto: docPhotoPath, selfie: selfiePath 
        });
        stmt.run({ fullName, cpf, birthDate, email, phone, cep, address, serviceType, cnpj, experience, bio, paymentMethods: paymentMethodsString, password: hashedPassword, profilePic: profilePicPath, docPhoto: docPhotoPath, selfie: selfiePath });
        res.status(201).json({ success: true, message: 'Cadastro recebido com sucesso! Você será notificado após a aprovação.' });
    } catch (err) {
        let userMessage = 'Erro interno ao salvar o cadastro.';
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') { userMessage = 'Este CPF ou e-mail já está cadastrado.'; }
        res.status(500).json({ success: false, message: userMessage });
    }
});

app.post('/api/professionals/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }
    try {
        const sql = "SELECT * FROM professionals WHERE email = ?";
        const professional = db.prepare(sql).get(email);
        if (!professional) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }
        const passwordMatches = await bcrypt.compare(password, professional.password);
        if (!passwordMatches) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }
        req.session.isProfessionalLoggedIn = true;
        req.session.professionalId = professional.id;
        res.status(200).json({ success: true, message: 'Login bem-sucedido.', status: professional.status });
    } catch (err) {
        console.error('Erro no login do profissional:', err.message);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

app.get('/api/professionals/me', checkProfessionalAuth, (req, res) => {
    try {
        const professionalId = req.session.professionalId;
        const sql = "SELECT * FROM professionals WHERE id = ?";
        const professional = db.prepare(sql).get(professionalId);
        if (professional) {
            delete professional.password; 
            res.status(200).json({ success: true, data: professional });
        } else {
            res.status(404).json({ success: false, message: 'Profissional não encontrado.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

// ROTA PROTEGIDA: ATUALIZAR os dados do profissional logado
app.put('/api/professionals/me', checkProfessionalAuth, (req, res) => {
    try {
        const professionalId = req.session.professionalId;
        const { fullName, phone, bio, paymentMethods } = req.body;

        if (!fullName || !phone) {
            return res.status(400).json({ success: false, message: 'Nome e Telefone são obrigatórios.' });
        }

        const paymentMethodsString = Array.isArray(paymentMethods) ? paymentMethods.join(',') : paymentMethods;

        const sql = `
            UPDATE professionals 
            SET fullName = @fullName, phone = @phone, bio = @bio, paymentMethods = @paymentMethods
            WHERE id = @id
        `;
        
        const stmt = db.prepare(sql);
        const info = stmt.run({
            fullName,
            phone,
            bio,
            paymentMethods: paymentMethodsString,
            id: professionalId
        });

        if (info.changes > 0) {
            console.log(`Perfil do ID ${professionalId} atualizado com sucesso.`);
            res.status(200).json({ success: true, message: 'Perfil atualizado com sucesso!' });
        } else {
            res.status(404).json({ success: false, message: 'Nenhuma alteração foi feita ou profissional não encontrado.' });
        }

    } catch (err) {
        console.error('Erro ao atualizar perfil:', err.message);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

app.post('/api/reviews', (req, res) => {
    const { professional_id, rating, comment, client_name } = req.body;
    if (!professional_id || !rating || !comment || !client_name) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }
    try {
        const sql = `INSERT INTO reviews (professional_id, rating, comment, client_name) VALUES (@professional_id, @rating, @comment, @client_name)`;
        const stmt = db.prepare(sql);
        stmt.run({ professional_id, rating, comment, client_name });
        res.status(201).json({ success: true, message: 'Obrigado pela sua avaliação!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao salvar sua avaliação.' });
    }
});

app.get('/api/professionals', (req, res) => {
    const { service, bairro } = req.query;
    if (!service) { return res.status(400).json({ success: false, message: 'O tipo de serviço é obrigatório.' }); }
    let sql = "SELECT id, fullName, profilePic, serviceType, bio, bairro FROM professionals WHERE status = 'active' AND lower(serviceType) = lower(?)";
    const params = [service];

    if (bairro && bairro !== '') {
        sql += " AND lower(bairro) = lower(?)";
        params.push(bairro);
    }

    try {
        const professionalsFound = db.prepare(sql).all(...params);
        const professionalsWithCorrectPath = professionalsFound.map(prof => ({
            ...prof,
            profilePic: prof.profilePic ? prof.profilePic.replace(/\\/g, '/') : null
        }));
        res.status(200).json({ success: true, data: professionalsWithCorrectPath });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar profissionais.' });
    }
});

app.get('/api/professionals/:id', (req, res) => {
    try {
        const sql = "SELECT id, fullName, email, phone, bairro, serviceType, experience, paymentMethods, bio, profilePic FROM professionals WHERE id = ? AND status = 'active'";
        const professional = db.prepare(sql).get(req.params.id);
        if (professional) {
            professional.profilePic = professional.profilePic ? professional.profilePic.replace(/\\/g, '/') : null;
            res.status(200).json({ success: true, data: professional });
        } else {
            res.status(404).json({ success: false, message: 'Profissional não encontrado ou não está ativo.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

app.get('/api/reviews/:professional_id', (req, res) => {
    try {
        const sql = "SELECT * FROM reviews WHERE professional_id = ? ORDER BY createdAt DESC";
        const reviews = db.prepare(sql).all(req.params.professional_id);
        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar avaliações.' });
    }
});


// --- ROTAS DE ADMIN (Protegidas) ---
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        req.session.isLoggedIn = true;
        res.redirect('/admin.html');
    } else {
        res.redirect('/login.html?error=true');
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/admin.html');
        res.clearCookie('connect.sid');
        res.redirect('/login.html');
    });
});

app.get('/api/admin/pending', checkAuth, (req, res) => {
    try {
        const sql = "SELECT * FROM professionals WHERE status = 'pending' ORDER BY createdAt DESC";
        const pendingProfessionals = db.prepare(sql).all();
        const professionalsWithCorrectPath = pendingProfessionals.map(prof => ({
            ...prof,
            profilePic: prof.profilePic ? prof.profilePic.replace(/\\/g, '/') : null,
        }));
        res.status(200).json({ success: true, data: professionalsWithCorrectPath });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar cadastros pendentes.' });
    }
});

app.post('/api/admin/approve/:id', checkAuth, async (req, res) => {
    try {
        const professional = db.prepare("SELECT * FROM professionals WHERE id = ?").get(req.params.id);
        if (!professional) return res.status(404).json({ success: false, message: 'Profissional não encontrado.' });
        if (!professional.email) return res.status(400).json({ success: false, message: 'Cadastro do profissional sem e-mail, impossível gerar cobrança.' });
        const preferenceBody = {
            items: [{
                id: professional.id.toString(),
                title: 'Taxa de Inclusão - Resolve Pra Mim',
                description: `Acesso à plataforma para ${professional.fullName}`,
                quantity: 1,
                currency_id: 'BRL',
                unit_price: 1.00
            }],
            payer: { email: professional.email },
            back_urls: {
                success: `http://localhost:3000/payment-success.html`,
                failure: `http://localhost:3000/payment-failure.html`,
            },
            external_reference: professional.id.toString(),
            notification_url: `${process.env.NGROK_URL}/mercadopago-webhook`
        };
        const preference = new Preference(client);
        const response = await preference.create({ body: preferenceBody });
        db.prepare("UPDATE professionals SET status = 'payment_pending' WHERE id = ?").run(req.params.id);
        res.status(200).json({ success: true, paymentLink: response.init_point });
    } catch (err) {
        console.error('Erro ao aprovar e gerar pagamento:', err);
        res.status(500).json({ success: false, message: 'Erro ao gerar link de pagamento.' });
    }
});

app.post('/api/admin/reject/:id', checkAuth, (req, res) => {
    try {
        const info = db.prepare("UPDATE professionals SET status = 'rejected' WHERE id = ?").run(req.params.id);
        if (info.changes > 0) {
            res.status(200).json({ success: true, message: 'Profissional reprovado com sucesso.' });
        } else {
            res.status(404).json({ success: false, message: 'Profissional não encontrado.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao reprovar profissional.' });
    }
});

app.post('/mercadopago-webhook', async (req, res) => {
    try {
        const topic = req.body.topic || req.query.topic;
        if (topic === 'merchant_order') {
            const orderId = req.body.resource.split('/').pop();
            const merchantOrder = new MerchantOrder(client);
            const orderInfo = await merchantOrder.get({ merchantOrderId: orderId });
            if (orderInfo.order_status === 'paid') {
                const professionalId = orderInfo.external_reference;
                const sql = "UPDATE professionals SET status = 'active' WHERE id = ? AND status = 'payment_pending'";
                db.prepare(sql).run(professionalId);
                console.log(`SUCESSO: Profissional com ID ${professionalId} foi ativado via webhook!`);
            }
        }
        res.status(200).send('Webhook processado.');
    } catch (error) {
        res.status(500).send('Erro ao processar webhook');
    }
});

// --- 6. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});