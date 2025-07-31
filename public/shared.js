document.addEventListener('DOMContentLoaded', () => {
    const loggedOutNav = document.getElementById('logged-out-nav');
    const loggedInProNav = document.getElementById('logged-in-pro-nav');
    const loggedInClientNav = document.getElementById('logged-in-client-nav');

    const hideAllNavs = () => {
        if (loggedOutNav) loggedOutNav.style.display = 'none';
        if (loggedInProNav) loggedInProNav.style.display = 'none';
        if (loggedInClientNav) loggedInClientNav.style.display = 'none';
    };

    hideAllNavs();

    // Função para tentar verificar um tipo de usuário
    const checkUser = async (apiUrl, navElement, nameElementId) => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {

                return false; 
            }
            const result = await response.json();
            if (result && result.success) {
                hideAllNavs();
                if (navElement) {
                    navElement.style.display = 'flex';
                    const nameSpan = document.getElementById(nameElementId);
                    if (nameSpan) {
                        const name = result.data.name || result.data.fullName;
                        nameSpan.textContent = name.split(' ')[0];
                    }
                }
                return true; 
            }
            return false; 
        } catch (err) {
            console.error(`Erro de conexão ao verificar ${apiUrl}:`, err);
            return false;
        }
    };

    const init = async () => {
        const isPro = await checkUser('http://localhost:3000/api/professionals/me', loggedInProNav, 'pro-name');
        if (!isPro) {
            const isClient = await checkUser('http://localhost:3000/api/clients/me', loggedInClientNav, 'client-name');
            if (!isClient) {
                hideAllNavs();
                if (loggedOutNav) loggedOutNav.style.display = 'flex';
            }
        }
    };

    init();
});
// --- LÓGICA DO LOADER DE PÁGINA ---
const pageLoader = document.getElementById('page-loader');

document.querySelectorAll('a').forEach(link => {
    if (link.href.includes(window.location.hostname) && !link.href.includes('#')) {
        link.addEventListener('click', (e) => {
            if (pageLoader) {
                pageLoader.classList.add('show');
            }
        });
    }
});

window.addEventListener('pageshow', () => {
    if (pageLoader) {
        pageLoader.classList.remove('show');
    }
});