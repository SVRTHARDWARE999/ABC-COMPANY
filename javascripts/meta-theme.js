document.addEventListener("DOMContentLoaded", function() {
    // Get the value of the CSS variable --appbar-color
    const appBarColor = getComputedStyle(document.documentElement).getPropertyValue('--appbar-color').trim();

    // Create a meta tag for theme color
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = appBarColor;

    // Append the meta tag to the head
    document.head.appendChild(metaThemeColor);

    console.log('Meta theme color set to:', appBarColor); // Log the theme color to check if it is correctly set
});