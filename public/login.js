document.addEventListener('DOMContentLoaded', () => {
    const roleOptions = document.querySelectorAll('.role-option');
    const loginForm = document.getElementById('unifiedLoginForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const registerLink = document.getElementById('registerLink');
    let selectedRole = 'client'; 
    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedRole = option.dataset.role;

            if (selectedRole === 'client') {
                registerLink.href = 'cadastro-cliente.html';
            } else {
                registerLink.href = 'cadastro-profissional.html';
            }
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            errorMessageDiv.style.display = 'none';

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            
            const apiUrl = selectedRole === 'client' 
                ? 'http://localhost:3000/api/clients/login' 
                : 'http://localhost:3000/api/professionals/login';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    if (selectedRole === 'client') {
                        window.location.href = '/'; 
                    } else {
                        if (result.status === 'active') {
                            window.location.href = '/dashboard-profissional.html';
                        } else {
                            window.location.href = '/status-profissional.html';
                        }
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