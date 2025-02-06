document.addEventListener("DOMContentLoaded", function() {
    const productsContainer = document.querySelector(".dynamic-products");
    const loadingImage = document.createElement('img');
    loadingImage.src = 'sources/loading-fun-1.gif'; // Replace with the actual URL of the loading image
    loadingImage.classList.add('loading-image');

    const API = "https://script.google.com/macros/s/AKfycbyTJGEVy0sF3MHEBXDPdVspAL5aVZXXeTdqoj_RlepipnBZg8ow7lGeanRQeCsRL16DuA/exec";
    let start = 0;
    const limit = 16;
    let isLoading = false;
    let allDataLoaded = false;

    async function fetchProducts() {
        if (isLoading || allDataLoaded) return; // Prevent multiple simultaneous fetches or fetching after all data is loaded
        isLoading = true;

        try {
            productsContainer.style.backgroundColor = 'transparent'; // Set background color to transparent
            productsContainer.appendChild(loadingImage); // Show loading image

            const response = await fetch(`${API}?start=${start}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); // Check the full data structure

            if (data.data.length === 0) {
                allDataLoaded = true; // No more data to load
                productsContainer.removeChild(loadingImage); // Remove loading image
                return;
            }

            displayProducts(data.data); // Assuming data contains a property 'data' that holds the array
            start += limit; // Increment start by limit
        } catch (err) {
            console.error("Failed to fetch API data:", err);
        } finally {
            if (!allDataLoaded) {
                productsContainer.removeChild(loadingImage); // Remove loading image if there is more data to load
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

    function handleScroll() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            fetchProducts(); // Fetch next set of products when user scrolls to the bottom
        }
    }

    window.addEventListener('scroll', handleScroll);
    fetchProducts(); // Load initial products
});
