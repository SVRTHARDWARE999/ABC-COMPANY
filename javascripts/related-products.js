document.addEventListener("DOMContentLoaded", function() {
    const relatedProductsContainer = document.getElementById('related-products');
    let start = 0;
    const limit = 16;
    let isLoading = false;
    let allDataLoaded = false;
    let loadedProducts = new Set();

    async function fetchProducts() {
        if (!relatedProductsContainer) {
            console.error("Related products container not found!");
            return;
        }

        if (isLoading || allDataLoaded) return;
        isLoading = true;

        const category = new URLSearchParams(window.location.search).get('category');
        const currentProductCode = new URLSearchParams(window.location.search).get('code');

        if (!category) {
            console.error("Category is missing in the URL.");
            relatedProductsContainer.innerHTML = '<div class="error">Products not found</div>';
            return;
        }

        try {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbyTJGEVy0sF3MHEBXDPdVspAL5aVZXXeTdqoj_RlepipnBZg8ow7lGeanRQeCsRL16DuA/exec?category=${category}&start=${start}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data || !data.data || !data.data.length) {
                allDataLoaded = true;
                updateDynamicProductsMargin();
                return;
            }

            displayProducts(data, currentProductCode);
            start += limit;
        } catch (err) {
            console.error("Failed to fetch API data:", err);
            relatedProductsContainer.innerHTML = `<div class="error">Error loading products: ${err.message}</div>`;
        } finally {
            isLoading = false;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayProducts(data, currentProductCode) {
        if (!data || !relatedProductsContainer) {
            console.error("Product data or container is missing.");
            return;
        }

        // Filter and shuffle products
        const filteredProducts = shuffleArray(data.data.filter(product => {
            if (String(product.code) === String(currentProductCode)) return false;
            if (loadedProducts.has(product.code)) return false;
            loadedProducts.add(product.code);
            return true;
        }));

        if (filteredProducts.length === 0) {
            if (!relatedProductsContainer.querySelector('.dynamic-products')) {
                relatedProductsContainer.style.display = 'none';
            }
            return;
        }

        const productsHTML = filteredProducts.map(product => `
            <button class="product" onclick="window.location.href='product-details.html?code=${product.code}&category=${product.category}&brand=${product.brand}'">
                <img src="${product['image-1']}" alt="" loading="lazy">
                <p class="product-description">${product.description}</p>
                <p class="product-price"><a><span>${product.wholesale}</span><span>MRP ${product.mrp}</span></a><a>${product.discount}</a></p>
            </button>
        `).join('');

        if (!relatedProductsContainer.querySelector('.dynamic-products')) {
            relatedProductsContainer.innerHTML = `
                <h2>Related Products</h2>
                <div class="dynamic-products">
                    ${productsHTML}
                </div>
            `;
        } else {
            relatedProductsContainer.querySelector('.dynamic-products').insertAdjacentHTML('beforeend', productsHTML);
        }

        if (allDataLoaded) {
            updateDynamicProductsMargin();
        }
    }

    function updateDynamicProductsMargin() {
        const dynamicProducts = document.querySelector('.dynamic-products');
        if (dynamicProducts) {
            // Get all product buttons
            const products = dynamicProducts.querySelectorAll('.product');
            
            // If odd number of products, hide last one
            if (products.length % 2 !== 0) {
                products[products.length - 1].style.display = 'none';
            }
            
            // Add end image if not already present
            if (allDataLoaded && !dynamicProducts.querySelector('.page-end')) {
                const endImage = `<img src="sources/end.jpg" alt="end of the page" class="page-end">`;
                dynamicProducts.insertAdjacentHTML('beforeend', endImage);
                dynamicProducts.style.margin = '0';
            }
        }
    }
    
    function handleScroll() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            fetchProducts();
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    fetchProducts();
});