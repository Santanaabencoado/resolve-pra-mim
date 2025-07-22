document.addEventListener('DOMContentLoaded', () => {
    const clientRegisterForm = document.getElementById('clientRegisterForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const successMessageDiv = document.getElementById('successMessage');

    if (clientRegisterForm) {
        clientRegisterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            errorMessageDiv.style.display = 'none';

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                errorMessageDiv.textContent = 'As senhas não coincidem. Por favor, verifique.';
                errorMessageDiv.style.display = 'flex';
                return;
            }

            const formData = new FormData(clientRegisterForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/api/clients/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    clientRegisterForm.style.display = 'none';
                    successMessageDiv.style.display = 'block';
                } else {
                    errorMessageDiv.textContent = result.message || 'Não foi possível criar a conta.';
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