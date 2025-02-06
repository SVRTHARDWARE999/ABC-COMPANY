document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM fully loaded and parsed');

    // Delay to ensure the image is available in the DOM
    setTimeout(function() {
        // Get the image element by ID
        const thumbnailImage = document.getElementById('thumblain');
        console.log('Thumbnail Image Element:', thumbnailImage); // Log the image element to check if it is correctly selected

        if (thumbnailImage) {
            // Get the source of the image
            const imageUrl = thumbnailImage.src;
            console.log('Image URL:', imageUrl); // Log the image URL to check if it is correctly retrieved

            // Create a meta tag for og:image
            const metaOgImage = document.createElement('meta');
            metaOgImage.setAttribute('property', 'og:image');
            metaOgImage.content = imageUrl;

            // Append the meta tag to the head
            document.head.appendChild(metaOgImage);

            console.log('Meta og:image set to:', imageUrl); // Log the image URL to check if it is correctly set
            console.log('Meta tag appended to head:', metaOgImage.outerHTML); // Log the meta tag to check if it is correctly appended
        } else {
            console.error('Thumbnail image with ID "thumblain" not found.');
        }
    }, 1000); // Delay of 1 second
});