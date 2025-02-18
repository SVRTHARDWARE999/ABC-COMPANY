document.addEventListener("DOMContentLoaded", function() {
    const searchResultContainer = document.querySelector('.search-result');
    const noSearchContainer = document.querySelector('.no-search');
    let start = 0;
    const limit = 16;
    let isLoading = false;
    let allDataLoaded = false;
    let loadedProducts = new Set();

    async function fetchProducts() {
        if (!searchResultContainer || !noSearchContainer) {
            console.error("Search result or no-search container not found!");
            return;
        }

        if (isLoading || allDataLoaded) return;
        isLoading = true;

        const search = new URLSearchParams(window.location.search).get('search');

        if (!search) {
            console.error("Search query is missing in the URL.");
            searchResultContainer.style.display = 'none';
            noSearchContainer.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbwqh0Hs5sOdeoFz25Kny3Zcpw9F-hJCLEJEjp7tVgj5Dl5hrqTWyzHyUByJrO5ADsXddQ/exec?search=${search}&start=${start}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !data.data || data.data.length === 0) {
                searchResultContainer.style.display = 'none';
                noSearchContainer.style.display = 'flex';
                allDataLoaded = true;
                return;
            } else {
                searchResultContainer.style.display = '';
                noSearchContainer.style.display = 'none';
            }

            if (data.data.length < limit) {
                allDataLoaded = true;
            }

            displayProducts(data.data);
            start += limit;

        } catch (err) {
            console.error("Failed to fetch API data:", err);
            searchResultContainer.innerHTML = `<div class="error">Error loading products: ${err.message}</div>`;
        } finally {
            isLoading = false;
        }
    }

    function displayProducts(products) {
        if (!products || !searchResultContainer) return;

        let productsHTML = '';

        products.forEach(product => {
            if (loadedProducts.has(product.code)) return;
            loadedProducts.add(product.code);

            productsHTML += `
                <div class="product-card" onclick="window.location.href='product-details.html?code=${product.code}&category=${product.category}&brand=${product.brand}'">
                    <span>
                        <img src="${product['image-1']}" alt="Product Image" onerror="this.src='placeholder.jpg'"/>
                    </span>
                    <span>
                        <p class="description">${product.description}</p>
                        <p class="price">${product.wholesale} <b>&nbsp; +${product.gst}% GST</b></p>
                        <p class="mrp">MRP &nbsp;<b>${product['mrp-gst']}</b></p>
                        <p class="discount">Discount &nbsp;<b>${product.discount}</b></p>
                        <p class="moq">MOQ &nbsp;<b>${product.moq} ${product.units}</b></p>
                    </span>
                </div>
            `;
        });

        searchResultContainer.innerHTML += productsHTML;
    }

    function handleScroll() {
        if (!allDataLoaded && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            fetchProducts();
        }
    }

    window.addEventListener('scroll', handleScroll);
    fetchProducts();
});