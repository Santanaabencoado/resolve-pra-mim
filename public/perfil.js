// perfil.js - VERSÃO FINAL E CORRIGIDA

document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS GLOBAIS ---
    const loadingContainer = document.getElementById('loading-container');
    const profileContent = document.getElementById('profile-content');
    const reviewForm = document.getElementById('reviewForm');
    const reviewLoginPrompt = document.getElementById('review-login-prompt');
    const favoriteWrapper = document.getElementById('favorite-icon-wrapper');

    // --- LÓGICA PRINCIPAL ---
    const urlParams = new URLSearchParams(window.location.search);
    const professionalId = urlParams.get('id');

    if (!professionalId) {
        showError('ID do profissional não encontrado na URL.');
        return;
    }

    // --- FUNÇÃO PARA MOSTRAR NOTIFICAÇÃO "TOAST" ---
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.classList.add('show'); }, 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { toast.remove(); }, 500);
        }, 5000);
    }

    // --- FUNÇÃO PARA VERIFICAR O LOGIN DO CLIENTE E CONTROLAR A INTERFACE ---
    function checkClientLoginAndSetupPage() {
        fetch('http://localhost:3000/api/clients/me')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Não é um cliente logado');
            })
            .then(result => {
                if (result && result.success) {
                    if (reviewLoginPrompt) reviewLoginPrompt.style.display = 'none';
                    if (reviewForm) reviewForm.style.display = 'block';
                    if (favoriteWrapper) {
                        favoriteWrapper.style.display = 'block';
                        checkFavoriteStatus(professionalId);
                    }
                }
            })
            .catch(() => {
                if (reviewLoginPrompt) reviewLoginPrompt.style.display = 'block';
                if (reviewForm) reviewForm.style.display = 'none';
                if (favoriteWrapper) favoriteWrapper.style.display = 'none';
            });
    }

    // --- LÓGICA DE FAVORITOS ---
    let isCurrentlyFavorite = false;

    function checkFavoriteStatus(profId) {
        fetch(`http://localhost:3000/api/favorites/status/${profId}`)
            .then(res => res.json())
            .then(result => {
                if (result.success && result.isFavorite) {
                    isCurrentlyFavorite = true;
                    favoriteWrapper.classList.add('is-favorite');
                } else {
                    isCurrentlyFavorite = false;
                    favoriteWrapper.classList.remove('is-favorite');
                }
            })
            .catch(err => console.error("Erro ao verificar o estado de favorito:", err));
    }

    if (favoriteWrapper) {
        favoriteWrapper.addEventListener('click', () => {
            const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
            
            fetch(`http://localhost:3000/api/favorites/${professionalId}`, { method: method })
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        isCurrentlyFavorite = !isCurrentlyFavorite;
                        favoriteWrapper.classList.toggle('is-favorite');
                        showToast(isCurrentlyFavorite ? 'Adicionado aos Favoritos!' : 'Removido dos Favoritos.');
                    } else {
                        if (result.message && result.message.includes('Acesso não autorizado')) {
                            showToast(`Você precisa fazer login para favoritar.<br><br><a href="login.html" class="btn-moderno btn-principal" style="padding: 8px 15px; font-size: 0.9rem;">Fazer Login</a>`, 'error');
                        } else {
                            showToast(result.message, 'error');
                        }
                    }
                })
                .catch(err => showToast('Erro de conexão. Tente novamente.', 'error'));
        });
    }

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

    function fetchPublicPortfolio(id) {
        const gallery = document.getElementById('portfolio-gallery-public');
        if (!gallery) return;
        fetch(`http://localhost:3000/api/portfolio/${id}`)
            .then(res => res.json())
            .then(result => {
                const portfolioSection = document.querySelector('.portfolio-section');
                if(result.success && result.data.length > 0) {
                    if (portfolioSection) portfolioSection.style.display = 'block';
                    gallery.innerHTML = '';
                    result.data.forEach(image => {
                        const imgElement = document.createElement('img');
                        imgElement.src = `http://localhost:3000/${image.image_path.replace(/\\/g, '/')}`;
                        imgElement.alt = image.caption || 'Foto do portfólio';
                        gallery.appendChild(imgElement);
                    });
                } else {
                    if (portfolioSection) portfolioSection.style.display = 'none';
                }
            });
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
        document.getElementById('profile-pic').src = prof.profilePic ? `http://localhost:3000/${prof.profilePic.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150';
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
                    if(result.message && result.message.includes('Acesso não autorizado')) {
                         showToast(
                            `Você precisa fazer login para avaliar.<br><br><a href="login.html" class="btn-moderno btn-principal" style="padding: 8px 15px; font-size: 0.9rem;">Fazer Login</a>`,
                            'error'
                        );
                    } else {
                        showToast(result.message || 'Ocorreu um erro.', 'error');
                    }
                    submitButton.disabled = false;
                    submitButton.textContent = 'Enviar Avaliação';
                }
            })
            .catch(error => {
                console.error('Erro ao enviar avaliação:', error);
                showToast('Não foi possível enviar sua avaliação. Tente novamente.', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar Avaliação';
            });
        });
    }

    // --- INICIA A EXECUÇÃO DAS TAREFAS DA PÁGINA ---
    if (professionalId) {
        fetchProfessionalData(professionalId);
        fetchReviews(professionalId);
        fetchPublicPortfolio(professionalId);
        checkLoginAndFavorites(); // A função principal que controla a visibilidade dos elementos
    }
});

