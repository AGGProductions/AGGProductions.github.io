// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBYbrgUSUy1s8k6giR5ecyCi3borCEUY5Q",
    authDomain: "rhythm-rampage-2c06c.firebaseapp.com",
    projectId: "rhythm-rampage-2c06c",
    storageBucket: "rhythm-rampage-2c06c.appspot.com",
    messagingSenderId: "243807481078",
    appId: "1:243807481078:web:d255ed764b64000d32d0d7"
  };
  
  // Initialize Firebase with your project configuration
  firebase.initializeApp(firebaseConfig);
  
  // Firebase Auth Google Sign-In
  function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        console.log("Logged in as:", result.user.displayName);
      })
      .catch(error => {
        console.error("Login error:", error);
      });
  }
  
  // Logout
  function logout() {
    firebase.auth().signOut()
      .then(() => {
        console.log("Logged out");
      })
      .catch(error => {
        console.error("Logout error:", error);
      });
  }
  
  // Check the user's authentication state and show/hide content accordingly
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    displayUploadedMaps();
    showUserProfile(user);
  } else {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('app-container').style.display = 'none';
  }

  displayUploadedMaps();
});

// Function to show the uploader's profile picture
function showUserProfile(user) {
  const profilePicture = document.getElementById('profile-picture');
  const displayName = document.getElementById('display-name');
  const email = document.getElementById('email');

  profilePicture.src = user.photoURL;
  displayName.textContent = user.displayName;
}
  
  // Handle form submission for uploading maps
const uploadForm = document.getElementById('upload-form');
uploadForm.addEventListener('submit', e => {
  e.preventDefault();

  const songName = document.getElementById('song-name').value;
  const artist = document.getElementById('artist').value;
  const mapFile = document.getElementById('map-file').files[0];

  // Preprocess the values for case-insensitive and punctuation-free search
  const songNameLower = songName.toLowerCase().replace(/[^\w\s]/g, '');
  const artistLower = artist.toLowerCase().replace(/[^\w\s]/g, '');
  const uploaderLower = firebase.auth().currentUser.displayName.toLowerCase().replace(/[^\w\s]/g, '');

  // Upload the map file to Firebase Storage
  const storageRef = firebase.storage().ref();
  const mapFileRef = storageRef.child(`maps/${mapFile.name}`);
  mapFileRef
    .put(mapFile)
    .then(snapshot => {
      // Get the download URL of the uploaded map file
      return snapshot.ref.getDownloadURL();
    })
    .then(downloadURL => {
      // Save map details (song name, artist, uploader, download link) to Firestore
      const db = firebase.firestore();
      db.collection('maps')
        .add({
          songName,
          artist,
          uploader: firebase.auth().currentUser.displayName,
          downloadURL,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          songNameLower, // Store case-insensitive and punctuation-free versions
          artistLower,
          uploaderLower
        })
        .then(() => {
          // Clear the form after successful upload
          uploadForm.reset();
          displayUploadedMaps();
        })
        .catch(error => {
          console.error('Error saving map details:', error);
        });
    })
    .catch(error => {
      console.error('Error uploading map file:', error);
    });
});

// Fetch and display the list of uploaded maps from Firestore
function displayUploadedMaps() {
  const db = firebase.firestore();
  db.collection('maps')
    .orderBy('timestamp', 'desc')
    .limit(5)
    .onSnapshot(snapshot => {
      const mapList = document.getElementById('map-list');
      mapList.innerHTML = '';
      snapshot.forEach(doc => {
        const mapData = doc.data();
        const mapItem = document.createElement('div');
        mapItem.innerHTML = `
          <p><strong>Uploader:</strong> ${mapData.uploader}</p>
          <p><strong>Song Name:</strong> ${mapData.songName}</p>
          <p><strong>Artist:</strong> ${mapData.artist}</p>
          <a href="${mapData.downloadURL}" download>Download Map</a>
          <hr>
        `;
        mapList.appendChild(mapItem);
      });
    }, error => {
      console.error('Error fetching uploaded maps:', error);
    });
}

// Fetch and display the list of uploaded maps from Firestore based on search input
function searchMaps(searchInput, searchCriteria) {
  // Preprocess the search input for case-insensitive and punctuation-free search
  const searchInputLower = searchInput.toLowerCase().replace(/[^\w\s]/g, '');

  const db = firebase.firestore();
  db.collection('maps')
    .where(searchCriteria + 'Lower', '>=', searchInputLower)
    .where(searchCriteria + 'Lower', '<=', searchInputLower + '\uf8ff')
    .get()
    .then(snapshot => {
      const searchResults = document.getElementById('search-results');
      searchResults.innerHTML = '';

      snapshot.forEach(doc => {
        const mapData = doc.data();
        const mapItem = document.createElement('div');
        mapItem.innerHTML = `
          <p><strong>Uploader:</strong> ${mapData.uploader}</p>
          <p><strong>Song Name:</strong> ${mapData.songName}</p>
          <p><strong>Artist:</strong> ${mapData.artist}</p>
          <a href="${mapData.downloadURL}" download>Download Map</a>
          <hr>
        `;
        searchResults.appendChild(mapItem);
      });
    })
    .catch(error => {
      console.error('Error fetching search results:', error);
    });
}

const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', e => {
  e.preventDefault();

  const searchInput = document.getElementById('search-input').value.trim();
  const searchCriteria = document.getElementById('search-criteria').value;

  if (searchInput !== '') {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = ''; // Clear previous search results

    searchMaps(searchInput, searchCriteria); // Call the search function with the input

    // Optionally, you can hide the top 5 uploaded maps when showing search results
    document.getElementById('map-list').style.display = 'none';
    searchResults.style.display = 'block'; // Display the search results section
  } else {
    // If the search input is empty, just display the top 5 uploaded maps
    document.getElementById('map-list').style.display = 'block';
    document.getElementById('search-results').style.display = 'none';
    displayUploadedMaps();
  }
});