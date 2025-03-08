document.addEventListener("DOMContentLoaded", function () {
    const wishlistContainer = document.querySelector('.wishlist-container');
    let start = 0;
    const limit = 16;
    let isLoading = false;
    let allDataLoaded = false;
    let loadedProducts = new Set();

    async function fetchWishlistProducts() {
        if (!wishlistContainer) {
            console.error("Wishlist container not found!");
            return;
        }

        if (isLoading || allDataLoaded) return;
        isLoading = true;

        const apiLoader = document.createElement('div');
        apiLoader.className = 'wishlist-loader';
        apiLoader.innerHTML = '<img src="sources/loading-fun-5.gif" alt="Loading..."/>';
        wishlistContainer.appendChild(apiLoader);

        let wishList = localStorage.getItem("WishList");

        if (wishList) {
            try {
                wishList = JSON.parse(wishList).map(item => item.trim()).join(',');
            } catch (err) {
                console.error("Error parsing WishList from localStorage:", err);
                wishList = "";
            }
        } else {
            wishList = "";
        }

        // Empty wishlist styling
        if (!wishList) {
            wishlistContainer.innerHTML = '<div class="empty-wishlist"><img src="sources/empty-wishlist-1.jpg"></div> <style>body{overflow:hidden;}</style>';
            return;
        }

        try {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbzTRrOGgdCcqlBZnTfGfqO66kQcW8jhu9D3M9zRr90wDw0RJ-L418LtvxewitB1guAlVw/exec?list=${wishList}&start=${start}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response Data:", data);

            if (!data || !data.data || !data.data.length) {
                allDataLoaded = true;
                return;
            }

            displayWishlistProducts(data);
            start += limit;
        } catch (err) {
            console.error("Failed to fetch API data:", err);
            wishlistContainer.innerHTML = `<div class="end">Error loading products: ${err.message}</div>`;
        } finally {
            isLoading = false;
            if (apiLoader.parentNode) {
                apiLoader.parentNode.removeChild(apiLoader);
            }
        }
    }

    function displayWishlistProducts(data) {
        if (!data || !wishlistContainer) {
            console.error("Product data or container is missing.");
            return;
        }

        const filteredProducts = data.data.filter(product => {
            if (loadedProducts.has(product.code)) return false;
            loadedProducts.add(product.code);
            return true;
        });

        if (filteredProducts.length === 0) return;

        const productsHTML = filteredProducts.map(product => {
            const moq = parseInt(product.moq);
            const savedQuantity = localStorage.getItem(`selectedQuantity-${product.code}`) || moq;

            return `
                <div class="products" data-code="${product.code}">
                    <div class="image" onclick="window.location.href='product-details.html?code=${product.code}&category=${product.category}&brand=${product.brand}'"><img src="${product['image-1']}" alt="product-image" /></div>
                    <div class="description">${product.description}</div>
                    <div class="price">${product.wholesale}</div>
                    <div class="button"><button class="delete-list">remove from list</button></div>
                </div>
            `;
        }).join('');

        wishlistContainer.insertAdjacentHTML('beforeend', productsHTML);
        attachEventListeners();
        restoreQuantities();
    }

    function attachEventListeners() {
        document.querySelectorAll(".quantity-select").forEach(select => {
            select.addEventListener("change", function () {
                const productCode = this.getAttribute("data-code");
                localStorage.setItem(`selectedQuantity-${productCode}`, this.value);
                calculateAndUpdateSubTotal(this);
            });
        });

        document.querySelectorAll(".delete-list").forEach(button => {
            button.addEventListener("click", function () {
                const itemElement = this.closest(".products");
                const productCode = itemElement.getAttribute("data-code");

                localStorage.removeItem(`selectedQuantity-${productCode}`);
                let wishList = JSON.parse(localStorage.getItem("WishList")) || [];
                wishList = wishList.filter(item => item !== productCode);
                localStorage.setItem("WishList", JSON.stringify(wishList));

                itemElement.remove();

                //////////// Check if wishlist is empty after removal
                if (wishList.length === 0) {
                    wishlistContainer.innerHTML = '<div class="empty-wishlist"><img src="sources/empty-wishlist-1.jpg"></div> <style>body{overflow:hidden;}</style>';
                }
            });
        });
    }

    function calculateAndUpdateSubTotal(selectElement) {
        const itemElement = selectElement.closest(".products");
        const wholesalePriceElement = itemElement.querySelector(".price");
        const subTotalValueElement = itemElement.querySelector(".sub-total-value");
        const quantity = parseInt(selectElement.value);

        if (!wholesalePriceElement || !subTotalValueElement) {
            console.error("Wholesale price or subtotal element not found.");
            return;
        }

        const wholesalePriceStr = wholesalePriceElement.textContent.trim().replace(/[₹,]/g, '');
        const wholesalePrice = parseFloat(wholesalePriceStr);

        if (isNaN(wholesalePrice)) {
            console.error("Invalid wholesale price format:", wholesalePriceStr);
            subTotalValueElement.textContent = "₹0";
            return;
        }

        const subTotal = quantity * wholesalePrice;
        subTotalValueElement.textContent = `₹${subTotal.toLocaleString('en-IN')}`;
    }

    function restoreQuantities() {
        document.querySelectorAll(".quantity-select").forEach(select => {
            const productCode = select.getAttribute("data-code");
            const savedQuantity = localStorage.getItem(`selectedQuantity-${productCode}`);
            if (savedQuantity) {
                select.value = savedQuantity;
            }
            calculateAndUpdateSubTotal(select);
        });
    }

    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                fetchWishlistProducts().then(restoreQuantities);
            }
        }, 200);
    }

    window.addEventListener('scroll', handleScroll);
    
    fetchWishlistProducts().then(restoreQuantities);
});