document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('pending-list-container');
    const detailsModal = document.getElementById('detailsModal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = detailsModal.querySelector('.close-btn');

    let pendingProfessionalsData = {}; 

      function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => { toast.classList.add('show'); }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { toast.remove(); }, 500);
        }, 3000); 
    }

    function fetchPendingProfessionals() {
        listContainer.innerHTML = '<p class="loading-message">Carregando cadastros...</p>';
        fetch('http://localhost:3000/api/admin/pending')
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    pendingProfessionalsData = {}; 
                    result.data.forEach(prof => {
                        pendingProfessionalsData[prof.id] = prof;
                    });
                    displayProfessionals(result.data);
                } else {
                    listContainer.innerHTML = `<p class="no-results-message">${result.message}</p>`;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar cadastros pendentes:', error);
                listContainer.innerHTML = `<p class="no-results-message">Não foi possível carregar os dados. O servidor está rodando?</p>`;
            });
    }

    function displayProfessionals(professionals) {
        listContainer.innerHTML = '';
        if (professionals.length === 0) {
            listContainer.innerHTML = `<p class="no-results-message">Ótima notícia! Nenhum cadastro pendente no momento.</p>`;
            return;
        }

        professionals.forEach(prof => {
            const card = document.createElement('div');
            card.className = 'pending-card';
            card.setAttribute('data-card-id', prof.id);

            const imagePath = prof.profilePic ? `http://localhost:3000/${prof.profilePic}` : 'https://via.placeholder.com/80';

            card.innerHTML = `
                <div class="pending-info" data-id="${prof.id}" style="cursor: pointer;">
                    <img src="${imagePath}" alt="Foto de ${prof.fullName}">
                    <div class="pending-details">
                        <h4>${prof.fullName}</h4>
                        <p><strong>Serviço:</strong> ${prof.serviceType} | <strong>CPF:</strong> ${prof.cpf}</p>
                    </div>
                </div>
                <div class="pending-actions">
                    <button class="btn-admin btn-approve" data-id="${prof.id}">Aprovar e Gerar Cobrança</button>
                    <button class="btn-admin btn-reject" data-id="${prof.id}">Reprovar</button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }

    function openDetailsModal(professionalId) {
        const prof = pendingProfessionalsData[professionalId];
        if (!prof) return;

        modalBody.innerHTML = `
            <div class="modal-section">
                <h4>Informações Pessoais</h4>
                <p><strong>Nome:</strong> ${prof.fullName}</p>
                <p><strong>CPF:</strong> ${prof.cpf}</p>
                <p><strong>Email:</strong> ${prof.email}</p>
                <p><strong>Telefone:</strong> ${prof.phone}</p>
                <p><strong>Endereço:</strong> ${prof.address}</p>
            </div>
            <div class="modal-section">
                <h4>Informações Profissionais</h4>
                <p><strong>Serviço:</strong> ${prof.serviceType}</p>
                <p><strong>CNPJ:</strong> ${prof.cnpj || 'Não informado'}</p>
                <p><strong>Experiência:</strong> ${prof.experience} anos</p>
                <p><strong>Bio:</strong> ${prof.bio || 'Não informada'}</p>
            </div>
            <div class="modal-section">
                <h4>Documentos Enviados</h4>
                <div class="document-gallery">
                    <div>
                        <p><strong>Foto de Perfil</strong></p>
                        <a href="http://localhost:3000/${prof.profilePic}" target="_blank"><img src="http://localhost:3000/${prof.profilePic}" alt="Foto de Perfil"></a>
                    </div>
                    <div>
                        <p><strong>Documento</strong></p>
                        <a href="http://localhost:3000/${prof.docPhoto}" target="_blank"><img src="http://localhost:3000/${prof.docPhoto}" alt="Foto do Documento"></a>
                    </div>
                    <div>
                        <p><strong>Selfie com Doc.</strong></p>
                        <a href="http://localhost:3000/${prof.selfie}" target="_blank"><img src="http://localhost:3000/${prof.selfie}" alt="Selfie com Documento"></a>
                    </div>
                </div>
            </div>
        `;

        detailsModal.style.display = 'block';
    }

      function handleAction(action, id, button) {
        button.disabled = true;
        button.textContent = 'Processando...';

        fetch(`http://localhost:3000/api/admin/${action}/${id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showToast(result.message || 'Ação realizada com sucesso!');
                removeCard(id); 
            } else {
                showToast(result.message || 'Ocorreu um erro.', 'error');
                button.disabled = false;
                button.textContent = action === 'approve' ? 'Aprovar e Gerar Cobrança' : 'Reprovar';
            }
        })
        .catch(error => {
            console.error(`Erro na ação ${action}:`, error);
            showToast('Erro de comunicação com o servidor.', 'error');
            button.disabled = false;
        });
    }

    function removeCard(id) {
        const cardToRemove = document.querySelector(`[data-card-id='${id}']`);
        if (cardToRemove) {
            cardToRemove.style.transition = 'opacity 0.5s ease';
            cardToRemove.style.opacity = '0';
            setTimeout(() => cardToRemove.remove(), 500);
        }
    }


    listContainer.addEventListener('click', (event) => {
        const target = event.target;
        const professionalId = target.closest('[data-id]')?.dataset.id;

        if (!professionalId) return;

        if (target.classList.contains('btn-approve')) {
            handleAction('approve', professionalId, target);
        } else if (target.classList.contains('btn-reject')) {
            handleAction('reject', professionalId, target);
        } else if (target.closest('.pending-info')) {
            openDetailsModal(professionalId);
        }
    });

    closeBtn.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    fetchPendingProfessionals();
});