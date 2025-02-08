document.addEventListener("DOMContentLoaded", function() {
    const productsContainer = document.querySelector(".dynamic-products");
    const loadingSpan = document.createElement('span');
    loadingSpan.className = 'api-loader';
    loadingSpan.innerHTML = '<img src="sources/loading-fun-1.gif" alt="Loading..." />'; // Replace with the actual URL of the loading image

    const API = "https://script.google.com/macros/s/AKfycbyKFlSIeA3DyWgOho8Uw6InFuF69SDpQUQ5C9D0_NpzmG5TGBbAIzBVsBNORlSRCHWwWQ/exec";
    let start = 0;
    const limit = 16;
    let isLoading = false;
    let allDataLoaded = false;

    async function fetchProducts() {
        if (isLoading || allDataLoaded) return; // Prevent multiple simultaneous fetches or fetching after all data is loaded
        isLoading = true;

        try {
            productsContainer.style.backgroundColor = 'transparent'; // Set background color to transparent
            productsContainer.appendChild(loadingSpan); // Show loading span

            const response = await fetch(`${API}?start=${start}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); // Check the full data structure

            if (data.data.length === 0) {
                allDataLoaded = true; // No more data to load
                productsContainer.removeChild(loadingSpan); // Remove loading span
                return;
            }

            displayProducts(data.data); // Assuming data contains a property 'data' that holds the array
            start += limit; // Increment start by limit
        } catch (err) {
            console.error("Failed to fetch API data:", err);
        } finally {
            if (!allDataLoaded) {
                productsContainer.removeChild(loadingSpan); // Remove loading span if there is more data to load
            }
            productsContainer.style.backgroundColor = ''; // Revert background color to normal
            isLoading = false;
        }
    }

    // Displaying API Products Data in HTML template Page
    function displayProducts(data) {
        if (productsContainer) { // Check if container is not null
            const shuffledData = shuffleArray(data); // Shuffle the data array
            shuffledData.forEach((product, index) => {
                console.log(`Product ${index}:`, product);
                const productTemplate = `
                <button class="product" onclick="window.location.href='product-details.html?code=${product.code}&category=${product.category}&brand=${product.brand}'">
                <img src="${product['image-1']}" alt="" srcset="">
                <p class="product-description">${product.description}</p>
                <p class="product-price"><a><span>${product.wholesale}</span><span>MRP ${product.mrp}</span></a><a>${product.discount}</a></p>
                </button>
                `;
                productsContainer.insertAdjacentHTML('beforeend', productTemplate);
                console.log(`Inserted product ${index} into container`);
            });
        } else {
            console.log("productsContainer is null. Ensure your HTML contains an element with class 'dynamic-products'.");
        }
    }

    // Function to shuffle an array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Add throttle function
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Update scroll handler
    function handleScroll() {
        const scrollPosition = window.innerHeight + window.pageYOffset;
        const threshold = document.documentElement.scrollHeight - 200;
        
        if (scrollPosition >= threshold && !isLoading && !allDataLoaded) {
            fetchProducts();
        }
    }

    // Remove old scroll listener and add new ones
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', throttle(handleScroll, 250), { passive: true });
    window.addEventListener('touchmove', throttle(handleScroll, 250), { passive: true });

    fetchProducts(); // Load initial products
});
