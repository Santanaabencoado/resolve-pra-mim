document.addEventListener('DOMContentLoaded', () => {
    const resultsTitle = document.getElementById('results-title');
    const resultsContainer = document.getElementById('results-container');
    const bairroFilter = document.getElementById('bairro-filter');
    const filterBtn = document.getElementById('filter-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('servico');

    if (service) {
        resultsTitle.textContent = `Resultados para "${service}"`;
        fetchProfessionals(service, ""); 
    } else {
        resultsTitle.textContent = 'Nenhum serviço especificado';
        resultsContainer.innerHTML = '<p class="no-results-message">Por favor, faça uma busca na página inicial.</p>';
    }

    filterBtn.addEventListener('click', () => {
        const selectedBairro = bairroFilter.value;
        fetchProfessionals(service, selectedBairro);
    });

    function fetchProfessionals(serviceQuery, bairroQuery) {
        resultsContainer.innerHTML = '<p class="loading-message">Buscando os melhores profissionais...</p>';

        let apiUrl = `http://localhost:3000/api/professionals?service=${encodeURIComponent(serviceQuery)}`;
        if (bairroQuery) {
            apiUrl += `&bairro=${encodeURIComponent(bairroQuery)}`;
        }

        fetch(apiUrl)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    displayProfessionals(result.data);
                } else {
                    displayNoResults(result.message);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar profissionais:', error);
                displayNoResults('Não foi possível carregar os resultados. Tente novamente mais tarde.');
            });
    }

    function displayProfessionals(professionals) {
        resultsContainer.innerHTML = '';

        if (professionals.length === 0) {
            displayNoResults(`Nenhum profissional encontrado para esta combinação de filtros.`);
            return;
        }

        professionals.forEach(prof => {
            const card = document.createElement('a');
            card.href = `perfil.html?id=${prof.id}`; 
            card.className = 'professional-card';
            const imagePath = prof.profilePic ? `http://localhost:3000/${prof.profilePic}` : 'https://via.placeholder.com/400x200/cccccc/ffffff?text=Sem+Foto';

            card.innerHTML = `
                <div class="card-image">
                    <img src="${imagePath}" alt="Foto de ${prof.fullName}">
                </div>
                <div class="card-content">
                    <h3>${prof.fullName}</h3>
                    <span class="service-tag">${prof.serviceType}</span>
                    <p class="bio">${prof.bio || 'Este profissional não adicionou uma descrição.'}</p>
                    <span class="btn-profile">Ver Perfil</span>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }

    function displayNoResults(message) {
        resultsContainer.innerHTML = `<p class="no-results-message">${message}</p>`;
    }
});