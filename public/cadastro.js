document.addEventListener('DOMContentLoaded', () => {

    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-btn');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetModal = document.querySelector(trigger.dataset.modalTarget);
            if (targetModal) {
                targetModal.style.display = 'block';
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    });

    const form = document.getElementById('proRegistrationForm');
    
    if (!form) return;

    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', () => {
        let value = cpfInput.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        cpfInput.value = value;
    });

    function validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let sum = 0, rest;
        for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        rest = (sum * 10) % 11;
        if ((rest === 10) || (rest === 11)) rest = 0;
        if (rest !== parseInt(cpf.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        rest = (sum * 10) % 11;
        if ((rest === 10) || (rest === 11)) rest = 0;
        if (rest !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    }

    function showError(input, message) {
        const formGroup = input.closest('.form-group, .terms-group');
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerText = message;
        input.classList.add('invalid');
        formGroup.appendChild(error);
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group, .terms-group');
        const error = formGroup.querySelector('.error-message');
        if (error) error.remove();
        input.classList.remove('invalid');
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        let isValid = true;
        
        document.querySelectorAll('.error-message').forEach(e => e.remove());
        document.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
        
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (passwordInput.value !== confirmPasswordInput.value) {
            isValid = false;
            showError(confirmPasswordInput, 'As senhas não coincidem. Por favor, verifique.');
        }

        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(input => {
            if (input.type === 'checkbox' ? !input.checked : !input.value.trim()) {
                isValid = false;
                showError(input, 'Este campo é obrigatório.');
            }
        });
        
        if (cpfInput.value.trim() && !validateCPF(cpfInput.value)) {
            isValid = false;
            showError(cpfInput, 'CPF inválido.');
        }
        
        if (isValid) {
            console.log("Formulário válido. Enviando dados para o servidor...");
            
            const formData = new FormData(form);

            fetch('http://localhost:3000/api/register-professional', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Resposta do servidor:', data);
                if (data.success) {
                    form.style.display = 'none';
                    const formHeader = document.querySelector('.form-header');
                    if (formHeader) formHeader.style.display = 'none';

                    document.getElementById('successMessage').style.display = 'block';
                    window.scrollTo(0, 0);
                } else {
                    alert('Erro no servidor: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao enviar o formulário:', error);
                alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
            });

        } else {
            console.log("Formulário inválido. Por favor, corrija os erros.");
        }
    });
});