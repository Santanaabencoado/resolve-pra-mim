document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginProForm');
    const errorMessageDiv = document.getElementById('errorMessage');

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        if (errorMessageDiv) {
            errorMessageDiv.style.display = 'flex';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            errorMessageDiv.style.display = 'none';

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/api/professionals/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    if (result.status === 'active') {
                        window.location.href = '/dashboard-profissional.html';
                    } else {
                        window.location.href = '/status-profissional.html';
                    }
                } else {
                    errorMessageDiv.style.display = 'flex';
                }

            } catch (error) {
                console.error('Erro de conexão:', error);
                errorMessageDiv.textContent = 'Erro de conexão. Tente novamente.';
                errorMessageDiv.style.display = 'flex';
            }
        });
    }
});