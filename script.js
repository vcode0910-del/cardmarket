// script.js
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const sections = document.querySelectorAll('.section-group');
    const items = document.querySelectorAll('.grid-item');

    searchInput.addEventListener('input', function(e) {
        const searchText = e.target.value.toLowerCase();

        sections.forEach(section => {
            let hasVisibleItems = false;
            const gridItems = section.querySelectorAll('.grid-item');

            gridItems.forEach(item => {
                const text = item.querySelector('.item-name').textContent.toLowerCase();
                
                if (text.includes(searchText)) {
                    item.style.display = 'block';
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // Sembunyikan judul kategori jika tidak ada item yang cocok di dalamnya
            if (hasVisibleItems) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    });
});
