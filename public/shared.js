// shared.js - VERSÃO COM LÓGICA PARA CLIENTE E PROFISSIONAL

document.addEventListener('DOMContentLoaded', () => {
    const loggedOutNav = document.getElementById('logged-out-nav');
    const loggedInProNav = document.getElementById('logged-in-pro-nav');
    const loggedInClientNav = document.getElementById('logged-in-client-nav');

    const hideAllNavs = () => {
        if (loggedOutNav) loggedOutNav.style.display = 'none';
        if (loggedInProNav) loggedInProNav.style.display = 'none';
        if (loggedInClientNav) loggedInClientNav.style.display = 'none';
    };

    // 1. Tenta verificar se um PROFISSIONAL está logado
    fetch('http://localhost:3000/api/professionals/me')
        .then(response => response.ok ? response.json() : null)
        .then(result => {
            if (result && result.success) {
                hideAllNavs();
                if (loggedInProNav) {
                    loggedInProNav.style.display = 'flex';
                    document.getElementById('pro-name').textContent = result.data.fullName.split(' ')[0];
                }
            } else {
                fetch('http://localhost:3000/api/clients/me')
                    .then(response => response.ok ? response.json() : null)
                    .then(clientResult => {
                        if (clientResult && clientResult.success) {
                            hideAllNavs();
                            if (loggedInClientNav) {
                                loggedInClientNav.style.display = 'flex';
                                document.getElementById('client-name').textContent = clientResult.data.name.split(' ')[0];
                            }
                        } else {
                            hideAllNavs();
                            if (loggedOutNav) loggedOutNav.style.display = 'flex';
                        }
                    });
            }
        })
        .catch(err => {
            hideAllNavs();
            if (loggedOutNav) loggedOutNav.style.display = 'flex';
        });
});