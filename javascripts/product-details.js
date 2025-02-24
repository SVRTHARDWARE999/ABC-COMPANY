document.addEventListener("DOMContentLoaded", function() {
    const productContainer = document.querySelector(".product-container"); // Ensure this matches the actual class name

    console.log('Product Container:', productContainer); // Log the product container to check if it is selected

    async function products() {
        const productId = new URLSearchParams(window.location.search).get('code');
        console.log('Product ID:', productId); // Log the product ID to check if it is correctly retrieved
        if (!productId) {
            console.error("Product ID is missing in the URL.");
            return;
        }

        try {
            document.body.style.overflow = 'hidden'; // Add overflow hidden to body
            const response = await fetch(`https://script.google.com/macros/s/AKfycbx8IKtLPW1Ts2ypBqVEtoM6-UVGA91PwGbnQ0r3yNAwh8zRkrjgba_7gx7derDgcJUAJw/exec?code=${productId}`); // Replace with actual API URL
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Product Data:', data); // Log the product data
            displayProducts(data);
        } catch (err) {
            console.error("Failed to fetch API data:", err);
        } finally {
            document.body.style.overflow = ''; // Remove overflow hidden from body
        }
    }

    function displayProducts(data) {
        if (!data || !productContainer) {
            console.error("Product data or container is missing.");
            return;
        }

        // Log the product object to check its structure
        console.log('Product Object:', data);

        // Assuming the data structure is { "data": [ { ... } ] }
        const product = data.data[0]; // Access the first element of the data array

        // Insert meta tags dynamically
        const imageUrl = product['image-1'] || '';
        const descriptionContent = product.description || 'No description available';

        // Store the description content in localStorage
        localStorage.setItem('shareText', descriptionContent);

        const metaOgImage = document.createElement('meta');
        metaOgImage.setAttribute('property', 'og:image');
        metaOgImage.content = imageUrl;
        document.head.appendChild(metaOgImage);
        console.log('Meta og:image set to:', imageUrl); // Log the image URL to check if it is correctly set
        console.log('Meta tag appended to head:', metaOgImage.outerHTML); // Log the meta tag to check if it is correctly appended

        const metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = descriptionContent;
        document.head.appendChild(metaDescription);
        console.log('Meta description set to:', descriptionContent); // Log the description to check if it is correctly set
        console.log('Meta tag appended to head:', metaDescription.outerHTML); // Log the meta tag to check if it is correctly appended

        // Insert text inside title tag
        document.title = descriptionContent;
        console.log('Title set to:', descriptionContent); // Log the title to check if it is correctly set

        productContainer.innerHTML = `
            <div class="product-description">
                ${descriptionContent}
            </div>
            
            <!-------------------------------- Swiper  Banners ----------------------------->
            <div class="swiper mySwiper">
                <div class="swiper-wrapper">
                    <div class="swiper-slide" style="${product['image-1'] || 'display:none;'}">
                        <div class="swiper-zoom-container">
                            <img src="${imageUrl}" alt="Image 1" srcset="" id="thumblain">
                        </div>
                    </div>
                    <div class="swiper-slide" style="${product['image-2'] || 'display:none;'}">
                        <div class="swiper-zoom-container">
                            <img src="${product['image-2'] || ''}" alt="Image 2" srcset="">
                        </div>
                    </div>
                    <div class="swiper-slide" style="${product['image-3'] || 'display:none;'}">
                        <div class="swiper-zoom-container">
                            <img src="${product['image-3'] || ''}" alt="Image 3" srcset="">
                        </div>
                    </div>
                    <div class="swiper-slide" style="${product['image-4'] || 'display:none;'}">
                        <div class="swiper-zoom-container">
                            <img src="${product['image-4'] || ''}" alt="Image 4" srcset="">
                        </div>
                    </div>
                    <div class="swiper-slide" style="${product['image-5'] || 'display:none;'}">
                        <div class="swiper-zoom-container">
                            <img src="${product['image-5'] || ''}" alt="Image 5" srcset="">
                        </div>
                    </div>
                    <div class="swiper-slide" style="${product['image-6'] || 'display:none;'}">
                        <div class="swiper-zoom-container">
                            <img src="${product['image-6'] || ''}" alt="Image 6" srcset="">
                        </div>
                    </div>
                    <div class="swiper-slide" style="${product['image-7'] || 'display:none;'}">
                        <div class="swiper-zoom-container">
                            <img src="${product['image-7'] || ''}" alt="Image 7" srcset="">
                        </div>
                    </div>
                </div>
                <div class="swiper-pagination"></div>
            </div>

            <!-- Product Pricing Details -->
            <div class="product-price">
                <div><b class="sale-price">${product.wholesale || 'N/A'}<span>+ ${product.gst || 'N/A'} GST</span></b><b class="mrp">MRP <span>${product.mrp || 'N/A'}</span></b><a>📦MOQ <span>${product.moq || 'N/A'} ${product.units || ''}</span> </a></div>
                <div class="discount">${product.discount || 'No discount available'}</div>
            </div>

            <div class="product-buttons">

                <div class="share-save">
                    <!-- Share Button -->
                    <button id="shareButton"><i class="fa-solid fa-share-nodes"></i> Share</button>
                    <!-- Share Button -->
                    <button id="save"><i class="fa-solid fa-bookmark"></i> Save</button>
                </div>
                <!-- Add to Cart -->
                <div id="cart-value" style="display:none;">${product.code}</div>
                <button id="cart" onclick="cart()"><i class="fa-solid fa-cart-shopping"></i> Add To Cart</button>
            
            </div>

            <!-- Product Detailed Table -->
            <h3>Product Details</h3>
            <table>
                <tr>
                    <td>Item Name</td>
                    <td>${product.name || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Category</td>
                    <td>${product.category || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Brand</td>
                    <td>${product.brand || 'N/A'}</td>
                </tr>
                <!-- Add more rows as needed -->
            </table>
        `;

        // Initialize Swiper
        var swiper = new Swiper(".mySwiper", {
            zoom: {
                maxRatio: 2,
            },
            spaceBetween: 30,
            loop: false,
            centeredSlides: true,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
                type: "bullets",
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });

        // Share API
        const shareButton = document.getElementById('shareButton');
        shareButton.addEventListener('click', async () => {
            const thumbnailImage = document.querySelector('.swiper-slide-active img');
            const pageUrl = window.location.href;
            const descriptionContent = localStorage.getItem('shareText') || 'No description available';

            if (thumbnailImage) {
                const imageUrl = thumbnailImage.src;
                if (navigator.share) {
                    try {
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        const imageBitmap = await createImageBitmap(blob);

                        // Check if the image is already in 1:1 aspect ratio
                        if (imageBitmap.width === imageBitmap.height) {
                            // Image is already 1:1, no need to modify
                            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

                            await navigator.share({
                                title: document.title,
                                text: descriptionContent,
                                url: pageUrl,
                                files: [file]
                            });
                        } else {
                            // Create a canvas to draw the image with a 1:1 aspect ratio and white background
                            const canvas = document.createElement('canvas');
                            const size = Math.max(imageBitmap.width, imageBitmap.height);
                            const padding = size * 0.05; // 5% padding
                            const paddedSize = size + padding * 2;
                            canvas.width = paddedSize;
                            canvas.height = paddedSize;
                            const ctx = canvas.getContext('2d');

                            // Fill the canvas with a white background
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, paddedSize, paddedSize);

                            // Draw the image in the center of the canvas with padding
                            const xOffset = (paddedSize - imageBitmap.width) / 2;
                            const yOffset = (paddedSize - imageBitmap.height) / 2;
                            ctx.drawImage(imageBitmap, xOffset, yOffset);

                            // Convert the canvas to a Blob
                            const newBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));

                            const file = new File([newBlob], 'image.jpg', { type: 'image/jpeg' });

                            await navigator.share({
                                title: document.title,
                                text: descriptionContent,
                                url: pageUrl,
                                files: [file]
                            });
                        }
                        console.log('Content shared successfully');
                    } catch (error) {
                        console.error('Error sharing content:', error);
                    }
                } else {
                    console.error('Web Share API is not supported in this browser.');
                }
            } else {
                console.error('Active thumbnail image not found.');
            }
        });

        const cartButton = document.getElementById("cart");
        if (cartButton) {
            cartButton.addEventListener("click", cart);
            updateCartButtonState();
        } else {
            console.error("Cart button not found after displayProducts");
        }

        // Clear localStorage when the page is closed
        window.addEventListener('beforeunload', () => {
            localStorage.removeItem('shareText');
        });
    }

    function updateCartButtonState() {
        const cartButton = document.getElementById("cart");
        if (!cartButton) return;

        const cartValueDiv = document.getElementById("cart-value");
        const allValues = JSON.parse(localStorage.getItem("CartValues")) || [];

        if (cartValueDiv) {
            const currentCartText = cartValueDiv.textContent || cartValueDiv.innerText;

            if (allValues.includes(currentCartText)) {
                cartButton.disabled = true;
                cartButton.innerHTML = '<i class="fa-solid fa-circle-check"></i> Added to Cart';
                // cartButton.style.color = "black";
                cartButton.classList.add('cart-active');
                cartButton.removeAttribute('id')
            } else {
                cartButton.disabled = false;
                cartButton.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Add to Cart';
                cartButton.classList.remove('cart-active');
            }
        }
    }

    function cart() {
        const cartButton = document.getElementById("cart");
        if (!cartButton) return;

        const cartValueDiv = document.getElementById("cart-value");

        if (cartValueDiv) {
            const cartText = cartValueDiv.textContent || cartValueDiv.innerText;
            const existingValues = JSON.parse(localStorage.getItem("CartValues")) || [];

            if (!existingValues.includes(cartText)) {
                existingValues.push(cartText);
                localStorage.setItem("CartValues", JSON.stringify(existingValues));
                console.log("Cart value added to localStorage:", cartText);
                updateCartButtonState();
            } else {
                console.log("Cart value already exists in localStorage:", cartText);
                // alert("This item is already in the cart.");
            }
            updateCartButtonState(); // Immediately update the cart button state
        } else {
            console.error("Cart Value div not found");
        }
    }

    products();
    updateCartButtonState(); // Call the function when the page is loaded
});