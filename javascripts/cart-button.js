function cart() {
    const cartValueDiv = document.getElementById("cart-value");
  
    if (cartValueDiv) {
      const cartText = cartValueDiv.textContent || cartValueDiv.innerText;
  
      // Get existing values from localStorage or initialize an empty array
      const existingValues = JSON.parse(localStorage.getItem("CartValues")) || [];
  
      existingValues.push(cartText); // Add the new value
  
      localStorage.setItem("CartValues", JSON.stringify(existingValues)); // Store the updated array
  
      console.log("Cart value added to localStorage:", cartText);
    } else {
      console.error("Element with id 'cart-value' not found.");
    }
  }
  
  const saveButton = document.getElementById("cart");
  if (saveButton) {
    saveButton.addEventListener("click", cart);
  } else {
    console.error("Save Cart button not found");
  }
  
  function getAllCartValues() {
    return JSON.parse(localStorage.getItem("CartValues")) || [];
  }
  
  const allValues = getAllCartValues();
  console.log("All cart values retrieved:", allValues);
  
  // Example: Display the retrieved values
  const cartDisplay = document.getElementById("cart-display");
  
  if (cartDisplay) {
    allValues.forEach(value => {  // Iterate directly over the values
      const valueElement = document.createElement("p");
      valueElement.textContent = value; // Display the value
      cartDisplay.appendChild(valueElement);
    });
  }