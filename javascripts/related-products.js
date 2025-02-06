document.addEventListener("DOMContentLoaded", function() {
    const relatedProductsContainer = document.getElementById('related-products');

    async function products() {
        if (!relatedProductsContainer) {
            console.error("Related products container not found!");
            return;
        }

        const category = new URLSearchParams(window.location.search).get('category');
        const currentProductCode = new URLSearchParams(window.location.search).get('code');

        if (!category) {
            console.error("Category is missing in the URL.");
            relatedProductsContainer.innerHTML = '<div class="error">Products not found</div>';
            return;
        }

        try {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbwG2CqkPgJDXqiqmvPZibsl4WnnOnDErXvagPpp9qkLqcCyEbP3Efy5qkujeFOwVZBZTQ/exec?category=${category}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data || !data.data || !data.data.length) {
                throw new Error('No products found in this category');
            }
            
            displayProducts(data, currentProductCode);
        } catch (err) {
            console.error("Failed to fetch API data:", err);
            relatedProductsContainer.innerHTML = `<div class="error">Error loading products: ${err.message}</div>`;
        }
    }

    function displayProducts(data, currentProductCode) {
        if (!data || !relatedProductsContainer) {
            console.error("Product data or container is missing.");
            return;
        }
    
        // Fisher-Yates shuffle algorithm
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    
        console.log("Current product code:", currentProductCode);
        console.log("All products:", data.data.map(p => p.code));
    
        // Filter and shuffle products
        const filteredProducts = shuffleArray(data.data.filter(product => {
            console.log(`Comparing: ${product.code} !== ${currentProductCode}`);
            return String(product.code) !== String(currentProductCode);
        }));
    
        console.log("Filtered and shuffled products:", filteredProducts.map(p => p.code));
    
        if (filteredProducts.length === 0) {
            relatedProductsContainer.style.display = 'none';
            return;
        }
    
        const productsHTML = filteredProducts.map(product => `
            <button class="product" onclick="window.location.href='product-details.html?code=${product.code}&category=${product.category}&brand=${product.brand}'">
                <img src="${product['image-1']}" alt="" srcset="">
                <p class="product-description">${product.description}</p>
                <p class="product-price"><a><span>${product.wholesale}</span><span>MRP ${product.mrp}</span></a><a>${product.discount}</a></p>
            </button>
        `).join('');
    
        relatedProductsContainer.innerHTML = `
            <h2>Related Products</h2>
            <div class="dynamic-products">
                ${productsHTML}
            </div>
        `;
    }

    products();
});