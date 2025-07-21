document.addEventListener('DOMContentLoaded', () => {

    const searchForm = document.getElementById('searchForm');
    const serviceInput = document.getElementById('serviceInput');

    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = serviceInput.value.trim();

            if (query) {

                window.location.href = `resultados.html?servico=${encodeURIComponent(query)}`;
            } else {
                alert('Por favor, digite um serviço para buscar.');
            }
        });
    }

});