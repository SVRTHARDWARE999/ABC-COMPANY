document.addEventListener("DOMContentLoaded", function() {
    const productsContainer = document.querySelector(".dynamic-products");
    const loadingImage = document.createElement('img');
    loadingImage.src = 'sources/loading-fun-1.gif'; // Replace with the actual URL of the loading image
    loadingImage.classList.add('loading-image');

    const API = "https://script.google.com/macros/s/AKfycbzmIiQqrBtWqlNiRDoqu6UqCivps8gbzngeOeMkO_tYqpgi4CMPL_ZrfQXSSu1_XacxlQ/exec";

    async function products() {
        try {
            productsContainer.style.backgroundColor = 'transparent'; // Set background color to transparent
            productsContainer.appendChild(loadingImage); // Show loading image

            const response = await fetch(API);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); // Check the full data structure
            localStorage.setItem('cachedProducts', JSON.stringify(data.data)); // Cache the data
            displayProducts(data.data); // Assuming data contains a property 'data' that holds the array
        } catch (err) {
            console.error("Failed to fetch API data:", err);
        } finally {
            productsContainer.removeChild(loadingImage); // Remove loading image
            productsContainer.style.backgroundColor = ''; // Revert background color to normal
        }
    }

    products();

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
});