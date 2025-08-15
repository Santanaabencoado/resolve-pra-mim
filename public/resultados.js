document.addEventListener('DOMContentLoaded', () => {
    const resultsTitle = document.getElementById('results-title');
    const resultsContainer = document.getElementById('results-container');
    const bairroFilter = document.getElementById('bairro-filter');
    const filterBtn = document.getElementById('filter-btn');

    // Mostrar loader inicial
    const pageLoader = document.getElementById('page-loader');
    
    // Obter parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('servico');

    if (service) {
        resultsTitle.textContent = `Resultados para "${service}"`;
        fetchProfessionals(service, ""); 
    } else {
        resultsTitle.textContent = 'Nenhum serviço especificado';
        resultsContainer.innerHTML = '<p class="no-results-message">Por favor, faça uma busca na página inicial.</p>';
        pageLoader.style.display = 'none';
    }

    // Configurar evento de filtro
    filterBtn.addEventListener('click', () => {
        const selectedBairro = bairroFilter.value;
        fetchProfessionals(service, selectedBairro);
    });

    // Função para buscar profissionais
    function fetchProfessionals(serviceQuery, bairroQuery) {
        resultsContainer.innerHTML = '<p class="loading-message">Buscando os melhores profissionais...</p>';
        pageLoader.style.display = 'flex';

        let apiUrl = `http://localhost:3000/api/professionals?service=${encodeURIComponent(serviceQuery)}`;
        if (bairroQuery) {
            apiUrl += `&bairro=${encodeURIComponent(bairroQuery)}`;
        }

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na resposta da API');
                }
                return response.json();
            })
            .then(result => {
                pageLoader.style.display = 'none';
                if (result.success) {
                    displayProfessionals(result.data);
                } else {
                    displayNoResults(result.message || 'Nenhum profissional encontrado');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar profissionais:', error);
                pageLoader.style.display = 'none';
                displayNoResults('Não foi possível carregar os resultados. Tente novamente mais tarde.');
            });
    }

    // Função para exibir profissionais
function displayProfessionals(professionals) {
    resultsContainer.innerHTML = '';

    if (!professionals || professionals.length === 0) {
        displayNoResults('Nenhum profissional encontrado para esta combinação de filtros.');
        return;
    }

    professionals.forEach(prof => {
            const card = document.createElement('a');
            card.href = `perfil.html?id=${prof.id}`; 
            card.className = 'professional-card';
            const imagePath = prof.profilePic ? `http://localhost:3000/${prof.profilePic}` : 'https://via.placeholder.com/400x200/cccccc/ffffff?text=Sem+Foto';
        // Tratamento para bio (evitar undefined)
        const bio = prof.bio || 'Este profissional não adicionou uma descrição ainda.';
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${imagePath}" alt="Foto de ${prof.fullName}" loading="lazy">
            </div>
            <div class="card-content">
                <h3>${prof.fullName}</h3>
                <span class="service-tag">${prof.serviceType || 'Profissional'}</span>
                <p class="bio">${bio}</p>
                <span class="btn-profile">Ver Perfil</span>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

    // Função para exibir mensagem quando não há resultados
    function displayNoResults(message) {
        resultsContainer.innerHTML = `
            <div class="no-results-message">
                <i class="fas fa-search" style="font-size: 2rem; color: var(--gray); margin-bottom: 15px;"></i>
                <p>${message}</p>
                <a href="index.html" class="btn-moderno btn-principal" style="margin-top: 20px;">Voltar para busca</a>
            </div>
        `;
    }
});