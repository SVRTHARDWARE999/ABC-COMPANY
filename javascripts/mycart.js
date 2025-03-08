document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.querySelector('.cart-items');
    let start = 0;
    const limit = 16;
    let isLoading = false;
    let allDataLoaded = false;
    let loadedProducts = new Set();
    const grandTotalElement = document.getElementById('grand-total');

    async function fetchProducts() {
        if (!cartItemsContainer) {
            console.error("Cart items container not found!");
            return;
        }

        if (isLoading || allDataLoaded) return;
        isLoading = true;

        const apiLoader = document.createElement('div');
        apiLoader.className = 'cart-loader';
        apiLoader.innerHTML = '<img src="sources/loading-fun-4.gif" alt="Loading..."/><style>.place-order{display:none;}</style>';
        cartItemsContainer.appendChild(apiLoader);

        let cartValues = localStorage.getItem("CartValues");

        if (cartValues) {
            try {
                cartValues = JSON.parse(cartValues).map(item => item.trim()).join(',');
            } catch (err) {
                console.error("Error parsing CartValues from localStorage:", err);
                cartValues = "";
            }
        } else {
            cartValues = "";
        }

        if (!cartValues) {
            cartItemsContainer.innerHTML = '<div class="empty-cart"><img src="sources/empty-cart.jpg"><style>.place-order{display:none;}</style></div>';
            return;
        }

        try {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbzTRrOGgdCcqlBZnTfGfqO66kQcW8jhu9D3M9zRr90wDw0RJ-L418LtvxewitB1guAlVw/exec?list=${cartValues}&start=${start}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response Data:", data);

            if (!data || !data.data || !data.data.length) {
                allDataLoaded = true;
                return;
            }

            displayProducts(data);
            start += limit;
        } catch (err) {
            console.error("Failed to fetch API data:", err);
            cartItemsContainer.innerHTML = `<div class="end">Error loading products: ${err.message}</div>`;
        } finally {
            isLoading = false;
            if (apiLoader.parentNode) {
                apiLoader.parentNode.removeChild(apiLoader);
            }
        }
    }

    function displayProducts(data) {
        if (!data || !cartItemsContainer) {
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
                <div class="items" data-code="${product.code}">
                    <div class="image" onclick="window.location.href='product-details.html?code=${product.code}&category=${product.category}&brand=${product.brand}'">
                        <img src="${product['image-1']}" alt="" />
                    </div>
                    <div class="details">
                        <div class="description">${product.description}</div>
                        <div class="product-name">
                            <span>name : &nbsp;</span>
                            <span>ABC-${product.code}</span>
                        </div>
                        <div class="product-brand">
                            <span>brand : &nbsp;</span>
                            <span>${product.brand}</span>
                        </div>
                        <div class="pricing">
                            <span>
                                <select class="quantity-select" data-code="${product.code}">
                                    <option value="${moq}" ${savedQuantity == moq ? 'selected' : ''}>${moq}</option>
                                    <option value="${moq * 2}" ${savedQuantity == moq * 2 ? 'selected' : ''}>${moq * 2}</option>
                                    <option value="${moq * 3}" ${savedQuantity == moq * 3 ? 'selected' : ''}>${moq * 3}</option>
                                </select>
                            </span>
                            <span> X </span>
                            <span>${product.wholesale}</span>
                        </div>
                        <div class="sub-total">
                            <span>Total : </span><span class="sub-total-value">₹0</span> </div>
                        <div class="delete" id="delect">
                            <button class="delete-item">
                                <i class="fa-solid fa-trash"></i>&nbsp; remove from cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        cartItemsContainer.insertAdjacentHTML('beforeend', productsHTML);
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

        document.querySelectorAll(".delete-item").forEach(button => {
            button.addEventListener("click", function () {
                const itemElement = this.closest(".items");
                const productCode = itemElement.getAttribute("data-code");

                localStorage.removeItem(`selectedQuantity-${productCode}`);
                let cartValues = JSON.parse(localStorage.getItem("CartValues")) || [];
                cartValues = cartValues.filter(item => item !== productCode);
                localStorage.setItem("CartValues", JSON.stringify(cartValues));

                itemElement.remove();
                updateGrandTotal(); // Update grand total after item removal

                // Check if cart is empty after removal
                if (cartValues.length === 0) {
                    cartItemsContainer.innerHTML = '<div class="empty-cart"><img src="sources/empty-cart.jpg"><style>.place-order{display:none;}</style></div>';
                }
            });
        });
    }

    function calculateAndUpdateSubTotal(selectElement) {
        const itemElement = selectElement.closest(".items");
        const wholesalePriceElement = itemElement.querySelector(".pricing span:last-of-type");
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
        updateGrandTotal();
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

    function updateGrandTotal() {
        let grandTotal = 0;
        const subTotalElements = document.querySelectorAll('.sub-total-value');

        subTotalElements.forEach(subTotalElement => {
            const subTotalStr = subTotalElement.textContent.trim().replace(/[₹,]/g, '');
            const subTotal = parseFloat(subTotalStr);

            if (!isNaN(subTotal)) {
                grandTotal += subTotal;
            } else {
                console.error("Invalid subtotal format:", subTotalStr);
            }
        });

        if (grandTotalElement) {
            grandTotalElement.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
        } else {
            console.error("Grand total element not found!");
        }
    }

    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                fetchProducts().then(restoreQuantities).then(updateGrandTotal);
            }
        }, 200);
    }

    window.addEventListener('scroll', handleScroll);
    
    fetchProducts().then(restoreQuantities).then(updateGrandTotal);
});