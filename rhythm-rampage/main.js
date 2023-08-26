// Function to load the iframe when the button is clicked
function loadIframe() 
{
  const iframe = document.getElementById('game-iframe');
  const placeholder = document.getElementById('placeholder');

  // Set the source of the iframe to load the game
  iframe.src = "";

  // Show the iframe and hide the placeholder
  iframe.style.display = "block";
  placeholder.style.display = "none";

  // Adjust the size of the iframe
  adjustIframeSize();
}

// Function to dynamically adjust the size of the iframe based on the window size
function adjustIframeSize() 
{
    const iframe = document.getElementById('game-iframe');
    const maxWidth = 854; // Maximum width of the iframe
    const maxHeight = 500; // Maximum height of the iframe
    
    // Calculate the maximum width and height based on the aspect ratio and window size
    let width = Math.min(window.innerWidth * 0.8, maxWidth); // 80% of window width or maxWidth
    let height = (width / maxWidth) * maxHeight;
    
    // Adjust width and height if they exceed the maximum values
    if (width > maxWidth) {
        width = maxWidth;
        height = (width / maxWidth) * maxHeight;
    }
    if (height > maxHeight) {
        height = maxHeight;
        width = (height / maxHeight) * maxWidth;
    }
    
    // Set the iframe width and height
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
}
    
// Call the function when the window is loaded and whenever the window size changes
window.addEventListener('load', adjustIframeSize);
window.addEventListener('resize', adjustIframeSize);