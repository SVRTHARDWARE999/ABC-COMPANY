function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }

    const searchQuery = searchInput.value.trim();
    if (searchQuery) {
        try {
            const searchUrl = `search.html?search=${encodeURIComponent(searchQuery)}`;
            window.location.href = searchUrl;
        } catch (error) {
            console.error('Error during search:', error);
        }
    }
}