document.addEventListener("DOMContentLoaded", function() 
    {
        function isMobile() {
            return /Mobi|Android/i.test(navigator.userAgent);
        }

        const main = document.querySelector('main');
        const qrCodeDiv = document.querySelector('.qr-code');
        const qrCodeImg = document.getElementById('qr-code-img');
        const pageUrl = window.location.href;

        if (isMobile()) {
            main.style.display = '';
            qrCodeDiv.style.display = 'none';
        } else {
            main.style.display = 'none';
            qrCodeDiv.style.display = 'flex';
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pageUrl)}&size=200x200`;
        }
    });