document.addEventListener("DOMContentLoaded", function () {
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

        // Add loading indicator
        const apiLoader = document.createElement('div');
        apiLoader.className = 'api-loader';
        apiLoader.innerHTML = '<img src="sources/loading-fun-3.gif" alt="Loading..."/>';
        relatedProductsContainer.appendChild(apiLoader);

        // Retrieve CartValues from localStorage
        let cartValues = localStorage.getItem("CartValues");

        if (cartValues) {
            try {
                cartValues = JSON.parse(cartValues)
                    .map(item => item.replace(',', ''))  // Remove extra commas
                    .join(',');  // Convert array to "1,2,3"
            } catch (err) {
                console.error("Error parsing CartValues from localStorage:", err);
                cartValues = "";
            }
        } else {
            console.error("CartValues not found in localStorage.");
            relatedProductsContainer.innerHTML = '<div class="error">Products not found</div>';
            return;
        }

        try {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbwqh0Hs5sOdeoFz25Kny3Zcpw9F-hJCLEJEjp7tVgj5Dl5hrqTWyzHyUByJrO5ADsXddQ/exec?cart=${cartValues}&start=${start}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response Data:", data); // Log API response for testing

            if (!data || !data.data || !data.data.length) {
                allDataLoaded = true;
                updateDynamicProductsMargin();
                return;
            }

            displayProducts(data);
            start += limit;
        } catch (err) {
            console.error("Failed to fetch API data:", err);
            relatedProductsContainer.innerHTML = `<div class="error">Error loading products: ${err.message}</div>`;
        } finally {
            isLoading = false;
            // Remove loading indicator
            if (apiLoader.parentNode) {
                apiLoader.parentNode.removeChild(apiLoader);
            }
            // Remove overflow hidden from body
            document.body.style.overflow = '';
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayProducts(data) {
        if (!data || !relatedProductsContainer) {
            console.error("Product data or container is missing.");
            return;
        }

        // Filter and shuffle products
        const filteredProducts = shuffleArray(data.data.filter(product => {
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
            <button class="product" onclick="window.location.href='product-details.html?code=${product.code}'">
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
            const products = dynamicProducts.querySelectorAll('.product');
            
            if (products.length % 2 !== 0) {
                products[products.length - 1].style.display = 'none';
            }
            
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
