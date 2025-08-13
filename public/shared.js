document.addEventListener('DOMContentLoaded', () => {
    const loggedOutNav = document.getElementById('logged-out-nav');
    const loggedInProNav = document.getElementById('logged-in-pro-nav');
    const loggedInClientNav = document.getElementById('logged-in-client-nav');
    const pageLoader = document.getElementById('page-loader');

    const initNav = async () => {
        if (loggedOutNav) loggedOutNav.style.display = 'none';
        if (loggedInProNav) loggedInProNav.style.display = 'none';
        if (loggedInClientNav) loggedInClientNav.style.display = 'none';

        try {
            // Tenta verificar se é um cliente
            const clientResponse = await fetch('http://localhost:3000/api/clients/me');
            if (clientResponse.ok) {
                const clientResult = await clientResponse.json();
                if (clientResult.success) {
                    if (loggedInClientNav) {
                        loggedInClientNav.style.display = 'flex';
                        const nameSpan = document.getElementById('client-name');
                        if (nameSpan) nameSpan.textContent = clientResult.data.name.split(' ')[0];
                    }
                    return; // Encontrou um cliente, para aqui
                }
            }

            // Se não for um cliente, tenta verificar se é um profissional
            const proResponse = await fetch('http://localhost:3000/api/professionals/me');
            if (proResponse.ok) {
                const proResult = await proResponse.json();
                if (proResult.success) {
                    if (loggedInProNav) {
                        loggedInProNav.style.display = 'flex';
                        const nameSpan = document.getElementById('pro-name');
                        if (nameSpan) nameSpan.textContent = proResult.data.fullName.split(' ')[0];
                    }
                    return; // Encontrou um profissional, para aqui
                }
            }

            // Se não for nenhum dos dois, mostra a navegação de deslogado
            if (loggedOutNav) loggedOutNav.style.display = 'flex';

        } catch (error) {
            console.error('Erro ao verificar o estado de login:', error);
            if (loggedOutNav) loggedOutNav.style.display = 'flex';
        }
    };

    initNav();

    // Lógica do Loader (mantém-se igual)
    document.querySelectorAll('a').forEach(link => {
        if (link.href && link.href.includes(window.location.hostname) && !link.href.includes('#')) {
            link.addEventListener('click', () => {
                if (pageLoader) pageLoader.classList.add('show');
            });
        }
    });

    window.addEventListener('pageshow', () => {
        if (pageLoader) pageLoader.classList.remove('show');
    });
});