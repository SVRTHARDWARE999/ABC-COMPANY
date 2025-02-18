document.addEventListener("DOMContentLoaded", function() {
    const swiperWrapper = document.querySelector(".swiper-wrapper");
    const loadingBanner = document.createElement('div');
    loadingBanner.className = 'banner-loader';
    loadingBanner.innerHTML = '<img src="sources/banner-loading.gif" alt="Loading..." />';

    const API_BASE = "https://script.google.com/macros/s/AKfycbwqh0Hs5sOdeoFz25Kny3Zcpw9F-hJCLEJEjp7tVgj5Dl5hrqTWyzHyUByJrO5ADsXddQ/exec";
    let start = 0;
    const limit = 16;
    let isLoading = false;
    let allDataLoaded = false;
    let isBannerData = false;
    let initialLoadDone = false;
    let swiper;

    function buildApiUrl(banner) {
        let url = API_BASE;
        if (banner) {
            url += "?banner=true";
            isBannerData = true;
        } else {
            url += `?start=${start}`;
            isBannerData = false;
        }
        return url;
    }

    async function fetchProducts(banner = false) {
        if (isLoading) return;
        isLoading = true;

        try {
            if (swiperWrapper) {
                swiperWrapper.appendChild(loadingBanner);
            }

            const apiUrl = buildApiUrl(banner);
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.data.length === 0) {
                removeLoadingBanner();
                return;
            }

            if (!initialLoadDone) {
                swiperWrapper.innerHTML = '';
                initialLoadDone = true;
            }

            displayProducts(data.data, banner);

            imagesLoaded(swiperWrapper, function() {
                swiper = new Swiper(".mySwiper", {
                    spaceBetween: 8,
                    loop: false,
                    centeredSlides: true,
                    autoplay: {
                        delay: 2800,
                        disableOnInteraction: false,
                    },
                    pagination: {
                        el: ".swiper-pagination",
                        clickable: true,
                    },
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                });
                swiper.autoplay.start();
            });

        } catch (err) {
            console.error("Failed to fetch API data:", err);
        } finally {
            removeLoadingBanner();
            isLoading = false;
        }
    }

    function removeLoadingBanner() {
        if (swiperWrapper && loadingBanner.parentNode === swiperWrapper) {
            swiperWrapper.removeChild(loadingBanner);
        }
    }

    function displayProducts(data, banner) {
        if (swiperWrapper) {
            const shuffledData = shuffleArray(data);
            shuffledData.forEach(product => {
                const productTemplate = `
                    <div class="swiper-slide" onclick="window.location.href='product-details.html?code=${product.code}&category=${product.category}&brand=${product.brand}'">
                        <div class="swiper-container">
                            <div class="banner-image"><img src="${product['image-1']}" alt="" /></div>
                            <div class="banner-details">
                                <p class="product-description">${product.description}</p>
                                <p>
                                    <span class="banner-price">₹${product.wholesale} <a>+${product.gst}% GST</a></span>
                                    <span class="banner-mrp">MRP : <a>₹${product.mrp}</a></span>
                                    <span class="banner-moq">MOQ : <a>${product.moq} ${product.units}</a></span>
                                    <span class="banner-discount">Discount : <a>${product.discount}</a></span>
                                </p>
                            </div>
                        </div>
                    </div>`;
                swiperWrapper.insertAdjacentHTML('beforeend', productTemplate);
            });
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

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

    function handleScroll() {
        const scrollPosition = window.innerHeight + window.pageYOffset;
        const threshold = document.documentElement.scrollHeight - 200;

        if (scrollPosition >= threshold && !isLoading && !allDataLoaded && !isBannerData) {
            fetchProducts();
        }
    }

    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', throttle(handleScroll, 250), { passive: true });
    window.addEventListener('touchmove', throttle(handleScroll, 250), { passive: true });

    fetchProducts(true); // Initial fetch for banner data

});