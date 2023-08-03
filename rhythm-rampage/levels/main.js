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

//Hamburger Menu
const menuButton = document.querySelector('.menu-button');
const navItems = document.querySelector('.nav-items');
      
menuButton.addEventListener('click', function () {
    // Toggle the 'show-menu' class on the header element
    document.querySelector('.header').classList.toggle('show-menu');
});

// Check the user's authentication state and show/hide content accordingly
firebase.auth().onAuthStateChanged(user => {
	if (user) {
		document.getElementById('login-container').style.display = 'none';
		document.getElementById('app-container').style.display = 'block';
		document.getElementById('upload-button').style.display = 'inline-block';
		document.getElementById('user-info').style.display = 'flex'; // Show user info
		showUserProfile(user);
	} else {
		document.getElementById('login-container').style.display = 'block';
		document.getElementById('app-container').style.display = 'none';
		document.getElementById('upload-button').style.display = 'none';
		document.getElementById('user-info').style.display = 'none';
		if (document.getElementById('upload-container').style.display = 'block'); {
			document.getElementById('upload-container').style.display = 'none';
			document.getElementById('home-container').style.display = 'block';
		}
	}

	displayUploadedMaps();
});

// Function to show the uploader's profile picture
function showUserProfile(user) {
	const profilePicture = document.getElementById('profile-picture');
	const displayName = document.getElementById('display-name');

	profilePicture.src = user.photoURL;
	displayName.textContent = user.displayName;
}

function upload() {
	document.querySelector('.header').classList.toggle('show-menu');
	document.getElementById('upload-container').style.display = 'block';
	document.getElementById('home-container').style.display = 'none';
	document.getElementById('search-container').style.display = 'none';
}

function home() {
	document.querySelector('.header').classList.toggle('show-menu');
	document.getElementById('upload-container').style.display = 'none';
	document.getElementById('home-container').style.display = 'block';
	document.getElementById('search-container').style.display = 'none';
}

function search() {
	document.querySelector('.header').classList.toggle('show-menu');
	document.getElementById('upload-container').style.display = 'none';
	document.getElementById('home-container').style.display = 'none';
	document.getElementById('search-container').style.display = 'block';
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

	// Generate a unique ID for the map
	const mapId = firebase.firestore().collection('maps').doc().id;

	// Upload the map file to Firebase Storage
	const storageRef = firebase.storage().ref();
	const mapFileRef = storageRef.child(`maps/${mapId}`); // Use the generated mapId as the file name
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
				.doc(mapId) // Use the generated mapId as the document ID
				.set({
					songName,
					artist,
					uploader: firebase.auth().currentUser.displayName,
					uploaderUID: firebase.auth().currentUser.uid,
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
			// Get the current user's UID
			// Check if the user is signed in before accessing the UID
			const currentUser = firebase.auth().currentUser;
			const currentUserUid = currentUser ? currentUser.uid : null;

			snapshot.forEach(doc => {
				const mapData = doc.data();
				const mapItem = document.createElement('div');
				mapItem.innerHTML = `
        		<p><strong>Song Name:</strong> ${mapData.songName}</p>
        		<p><strong>Artist:</strong> ${mapData.artist}</p>
				<p><strong>Uploader:</strong> ${mapData.uploader}</p>
        		<a href="${mapData.downloadURL}" download class="download-button">Download Map</a>`;
				mapList.appendChild(mapItem);
			});
		}, error => {
			console.error('Error fetching uploaded maps:', error);
		});
}

function deleteMap(docId, mapItem) {
	const db = firebase.firestore();
	const storageRef = firebase.storage().ref();

	// Delete the map data from Firestore
	db.collection('maps')
		.doc(docId) // Use the document ID instead of map ID
		.delete()
		.then(() => {
			console.log('Map data successfully deleted from Firestore.');
			// Now delete the associated file from Firebase Storage
			return storageRef.child(`maps/${docId}`).delete(); // Use the document ID instead of map ID
		})
		.then(() => {
			console.log('Map file successfully deleted from Firebase Storage.');
			// Refresh the displayed map list after successful deletion
			displayUploadedMaps();
			mapItem.remove();
		})
		.catch(error => {
			console.error('Error deleting map:', error);
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
				const noResultsMessage = document.getElementById('no-results-message');
				searchResults.innerHTML = '';
				noResultsMessage.style.display = 'none'; // Hide the message initially

				const currentUser = firebase.auth().currentUser;
				const currentUserUid = currentUser ? currentUser.uid : null;
				if (snapshot.empty) {
					noResultsMessage.style.display = 'block'; // Show the message if no results are found
				}
				else {
					snapshot.forEach(doc => {
				const mapData = doc.data();
				const mapItem = document.createElement('div');
				mapItem.innerHTML = `
				<p><strong>Song Name:</strong> ${mapData.songName}</p>
				<p><strong>Artist:</strong> ${mapData.artist}</p>
				<p><strong>Uploader:</strong> ${mapData.uploader}</p>
				<a href="${mapData.downloadURL}" download>Download Map</a>
				${
				// Show the "Delete" button only if the current user is the uploader and is signed in
				currentUserUid && mapData.uploaderUID === currentUserUid
				? `<button onclick="deleteMap('${doc.id}', this.parentElement)">Delete</button>`: ''
				}`;
			searchResults.appendChild(mapItem);
			});
		}
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

  if (searchInput == '') 
    return;
  const searchResults = document.getElementById('search-results');
  searchResults.innerHTML = ''; // Clear previous search results

  searchMaps(searchInput, searchCriteria); // Call the search function with the input
});