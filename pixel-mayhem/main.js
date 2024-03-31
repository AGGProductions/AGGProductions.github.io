function verify() {
    var userNumber = document.getElementById('userNumber').value;
    var spokenNumber = 69;
    
    if (userNumber == spokenNumber) {
        var video = document.getElementById('gameVideo');
        video.play();
        document.body.classList.remove('initial-hide'); // Remove the class to show the main content
        document.getElementById('remove').style.display = 'none';
    } else {
        alert("Incorrect number. Please try again.");
    }
}