require('dotenv').config();
const nodemailer = require('nodemailer');

// 1. Configura o "carteiro" (transporter) que vai enviar os e-mails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 2. Função para enviar o e-mail de confirmação de cadastro
async function sendRegistrationEmail(professionalEmail, professionalName) {
    const mailOptions = {
        from: `"Resolve Pra Mim" <${process.env.EMAIL_USER}>`,
        to: professionalEmail,
        subject: 'Seu cadastro no Resolve Pra Mim foi recebido!',
        html: `
            <h1>Olá, ${professionalName}!</h1>
            <p>Recebemos seu cadastro com sucesso.</p>
            <p>Nossa equipe irá analisar suas informações e, em breve, você receberá um novo e-mail com os próximos passos para ativar seu perfil.</p>
            <br>
            <p>Atenciosamente,</p>
            <p><strong>Equipe Resolve Pra Mim</strong></p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de confirmação de cadastro enviado para ${professionalEmail}`);
    } catch (error) {
        console.error(`Erro ao enviar e-mail de cadastro para ${professionalEmail}:`, error);
    }
}

// 3. Função para enviar o e-mail com o link de pagamento
async function sendPaymentLinkEmail(professionalEmail, professionalName, paymentLink) {
    const mailOptions = {
        from: `"Resolve Pra Mim" <${process.env.EMAIL_USER}>`,
        to: professionalEmail,
        subject: 'Próximo passo: Ative seu perfil no Resolve Pra Mim',
        html: `
            <h1>Parabéns, ${professionalName}!</h1>
            <p>Seu cadastro foi aprovado pela nossa equipe!</p>
            <p>O último passo para ativar seu perfil e começar a receber clientes é efetuar o pagamento da taxa de inclusão. O link é válido por 24 horas.</p>
            <a href="${paymentLink}" style="background-color: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-size: 1.2rem; display: inline-block; margin: 20px 0;">Pagar Taxa de Inclusão</a>
            <p>Após a confirmação do pagamento, seu perfil será ativado automaticamente em nosso site.</p>
            <br>
            <p>Atenciosamente,</p>
            <p><strong>Equipe Resolve Pra Mim</strong></p>
        `
    };

     try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de pagamento enviado para ${professionalEmail}`);
    } catch (error) {
        console.error(`Erro ao enviar e-mail de pagamento para ${professionalEmail}:`, error);
    }
}

module.exports = {
    sendRegistrationEmail,
    sendPaymentLinkEmail
};