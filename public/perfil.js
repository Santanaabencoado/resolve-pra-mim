document.addEventListener('DOMContentLoaded', () => {
    const loadingContainer = document.getElementById('loading-container');
    const profileContent = document.getElementById('profile-content');
    const reviewForm = document.getElementById('reviewForm');
    
    const urlParams = new URLSearchParams(window.location.search);
    const professionalId = urlParams.get('id');

    if (!professionalId) {
        showError('ID do profissional não encontrado na URL.');
        return;
    }

    fetchProfessionalData(professionalId);
    fetchReviews(professionalId);

    // --- Funções de Busca (Fetch) ---

    function fetchProfessionalData(id) {
        fetch(`http://localhost:3000/api/professionals/${id}`)
            .then(response => {
                if (!response.ok) { throw new Error('Profissional não encontrado.'); }
                return response.json();
            })
            .then(result => {
                if (result.success) {
                    populateProfile(result.data);
                } else {
                    showError(result.message);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar dados do profissional:', error);
                showError(error.message);
            });
    }

    function fetchReviews(id) {
        fetch(`http://localhost:3000/api/reviews/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    displayReviews(result.data);
                } else {
                    console.error('Não foi possível carregar as avaliações.');
                }
            })
            .catch(error => console.error('Erro ao buscar avaliações:', error));
    }

    // --- Funções de Exibição (Display) ---

    function displayReviews(reviews) {
        const reviewsContainer = document.getElementById('reviews-list-container');
        reviewsContainer.innerHTML = ''; 

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p>Este profissional ainda não tem avaliações. Seja o primeiro!</p>';
            return;
        }

        reviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'review-card';
            const reviewDate = new Date(review.createdAt).toLocaleDateString('pt-BR');
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

            card.innerHTML = `
                <div class="review-header">
                    <span class="client-name">${review.client_name}</span>
                    <span class="review-date">${reviewDate}</span>
                </div>
                <div class="review-stars">${stars}</div>
                <p class="review-comment">${review.comment}</p>
            `;
            reviewsContainer.appendChild(card);
        });
    }

    function populateProfile(prof) {
        loadingContainer.style.display = 'none';
        profileContent.style.display = 'grid';

        document.title = `${prof.fullName} - Resolve Pra Mim`;
        document.getElementById('profile-pic').src = prof.profilePic ? `http://localhost:3000/${prof.profilePic}` : 'https://via.placeholder.com/150';
        document.getElementById('profile-pic').alt = `Foto de ${prof.fullName}`;
        document.getElementById('profile-name').textContent = prof.fullName;
        document.getElementById('profile-service-type').textContent = prof.serviceType;
        document.getElementById('profile-bio').textContent = prof.bio || 'Este profissional ainda não adicionou uma biografia.';
        document.getElementById('profile-experience').textContent = prof.experience;
        document.getElementById('profile-location').textContent = prof.bairro;

        const phoneDigits = prof.phone.replace(/\D/g, '');
        document.getElementById('profile-whatsapp-link').href = `https://wa.me/55${phoneDigits}`;
        
        const paymentContainer = document.getElementById('profile-payment-methods');
        paymentContainer.innerHTML = ''; 
        if (prof.paymentMethods && prof.paymentMethods.length > 0) {
            const methods = prof.paymentMethods.split(',');
            methods.forEach(method => {
                const methodTag = document.createElement('span');
                methodTag.className = 'method';
                methodTag.textContent = method;
                paymentContainer.appendChild(methodTag);
            });
        } else {
            paymentContainer.innerHTML = '<span class="method">Não informado</span>';
        }

        document.getElementById('professionalIdInput').value = prof.id;
    }

    function showError(message) {
        loadingContainer.innerHTML = `<p class="no-results-message">${message}</p>`;
        profileContent.style.display = 'none';
    }
    
    // --- Lógica de Eventos ---

    if(reviewForm) {
        reviewForm.addEventListener('submit', (event) => {
            event.preventDefault(); 

            const submitButton = reviewForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            const formData = new FormData(reviewForm);
            const reviewData = Object.fromEntries(formData.entries());

            fetch('http://localhost:3000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    reviewForm.innerHTML = `<div class="success-message" style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; text-align: center;">${result.message}</div>`;
                    fetchReviews(professionalId);
                } else {
                    alert(`Erro: ${result.message}`);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Enviar Avaliação';
                }
            })
            .catch(error => {
                console.error('Erro ao enviar avaliação:', error);
                alert('Não foi possível enviar sua avaliação. Tente novamente.');
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar Avaliação';
            });
        });
    }
});