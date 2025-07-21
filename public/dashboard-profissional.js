document.addEventListener('DOMContentLoaded', () => {
    const dashboardContainer = document.getElementById('dashboard-container');
    let currentProfessionalData = null; 

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000); 
    }

    function fetchAndRenderDashboard() {
        fetch('http://localhost:3000/api/professionals/me')
            .then(response => {
                if (response.status === 401) {
                    window.location.href = '/login-profissional.html';
                    return;
                }
                return response.json();
            })
            .then(result => {
                if (result && result.success) {
                    currentProfessionalData = result.data;
                    renderDashboard(currentProfessionalData);
                } else {
                    dashboardContainer.innerHTML = `<p class="no-results-message">${result.message || 'Não foi possível carregar seus dados.'}</p>`;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar dados do painel:', error);
                dashboardContainer.innerHTML = `<p class="no-results-message">Erro de conexão.</p>`;
            });
    }

    function renderDashboard(prof) {
        dashboardContainer.innerHTML = '';
        
        const header = document.createElement('div');
        header.className = 'dashboard-header';
        header.innerHTML = `<h1>Olá, ${prof.fullName.split(' ')[0]}!</h1>`;
        dashboardContainer.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'dashboard-grid';
        
        let statusClass = 'status-pending';
        let statusText = 'Pendente';
        if(prof.status === 'active') { statusClass = 'status-active'; statusText = 'Ativo'; }
        else if (prof.status === 'rejected') { statusClass = 'status-rejected'; statusText = 'Rejeitado'; }
        else if (prof.status === 'payment_pending') { statusText = 'Aguardando Pagamento'; }

        grid.innerHTML = `
            <div class="dashboard-card">
                <h3>Status do seu Perfil</h3>
                <p>Seu perfil está: <span class="status-badge ${statusClass}">${statusText}</span></p>
                <p>${statusText === 'Ativo' ? 'Parabéns! Seu perfil está visível para os clientes!' : 'Seu perfil não está visível nas buscas no momento.'}</p>
            </div>
            <div class="dashboard-card">
                <h3>
                    Suas Informações
                    <button id="edit-btn" class="btn-edit"><i class="fa-solid fa-pencil"></i> Editar</button>
                </h3>
                <div id="view-mode">
                    <p><strong>Nome:</strong> <span id="view-name">${prof.fullName}</span></p>
                    <p><strong>Email:</strong> <span id="view-email">${prof.email}</span></p>
                    <p><strong>Telefone:</strong> <span id="view-phone">${prof.phone}</span></p>
                    <p><strong>Serviço:</strong> <span id="view-service">${prof.serviceType}</span></p>
                </div>
                <form id="edit-form" style="display: none;">
                    <div class="form-group">
                        <label for="fullName">Nome Completo</label>
                        <input type="text" id="edit-fullName" name="fullName" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Telefone</label>
                        <input type="tel" id="edit-phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="bio">Sua Biografia</label>
                        <textarea id="edit-bio" name="bio" rows="4"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-save">Salvar Alterações</button>
                        <button type="button" id="cancel-btn" class="btn-cancel">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        dashboardContainer.appendChild(grid);

        addDashboardEventListeners();
    }
    
    function addDashboardEventListeners() {
        const editBtn = document.getElementById('edit-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const editForm = document.getElementById('edit-form');
        const viewMode = document.getElementById('view-mode');

        editBtn.addEventListener('click', () => {
            document.getElementById('edit-fullName').value = currentProfessionalData.fullName;
            document.getElementById('edit-phone').value = currentProfessionalData.phone;
            document.getElementById('edit-bio').value = currentProfessionalData.bio;
            
            viewMode.style.display = 'none';
            editForm.style.display = 'block';
        });

        cancelBtn.addEventListener('click', () => {
            viewMode.style.display = 'block';
            editForm.style.display = 'none';
        });

        editForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(editForm);
            const updatedData = Object.fromEntries(formData.entries());

            fetch('http://localhost:3000/api/professionals/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            })
            .then(res => res.json())
            .then(result => {
                if(result.success) {
                    showToast('Perfil atualizado com sucesso!');
                    fetchAndRenderDashboard();
                } else {
                    showToast('Erro ao atualizar: ' + result.message, 'error');
                }
            })
            .catch(err => showToast('Erro de conexão ao salvar.', 'error'));
        });
    }

    fetchAndRenderDashboard();
});