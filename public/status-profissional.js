document.addEventListener('DOMContentLoaded', () => {
    const statusInfoDiv = document.getElementById('status-info');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    fetch('/api/professionals/me')
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login-profissional.html';
                return;
            }
            return response.json();
        })
        .then(result => {
            if (result && result.success) {
                updateProgress(result.data);
            } else {
                statusInfoDiv.innerHTML = `<p>Não foi possível carregar seu status.</p>`;
            }
        });

    function updateProgress(prof) {
        step1.classList.remove('completed');
        step2.classList.remove('completed');
        step3.classList.remove('completed');

        if (prof.status === 'pending') {
            step1.classList.add('completed');
            statusInfoDiv.innerHTML = `<p>Recebemos seu cadastro! Nossa equipe está analisando suas informações. Você será notificado por e-mail quando for aprovado.</p>`;
        } else if (prof.status === 'payment_pending') {
            step1.classList.add('completed');
            step2.classList.add('completed');
            statusInfoDiv.innerHTML = `<p>Parabéns, seu cadastro foi aprovado! O próximo passo é o pagamento da taxa de inclusão. Por favor, verifique seu e-mail para encontrar o link de pagamento.</p>`;
        } else if (prof.status === 'active') {
            window.location.href = '/dashboard-profissional.html';
        } else if (prof.status === 'rejected') {
            statusInfoDiv.innerHTML = `<p>Após análise, seu cadastro não foi aprovado no momento. Por favor, entre em contato para mais detalhes.</p>`;
        }
    }
});