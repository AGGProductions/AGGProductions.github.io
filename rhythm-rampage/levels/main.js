// Call the function to display level details when the page loads
window.onload = function() 
{
    displayLevelDetails();
};

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
		if (document.getElementById('upload-container').style.display == "block" ||
			document.getElementById('profile-container').style.display == 'block') {
			document.getElementById('upload-container').style.display = 'none';
			document.getElementById('profile-container').style.display = 'none';
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
	document.querySelector('.header').classList.remove('show-menu');
	document.getElementById('upload-container').style.display = 'block';
	document.getElementById('home-container').style.display = 'none';
	document.getElementById('search-container').style.display = 'none';
	document.getElementById('profile-container').style.display = 'none';
	document.getElementById('share-container').style.display = 'none';
	const urlWithoutParams = window.location.href.split('?')[0];
  	window.history.replaceState({}, document.title, urlWithoutParams);
}

function home() {
	document.querySelector('.header').classList.remove('show-menu');
	document.getElementById('upload-container').style.display = 'none';
	document.getElementById('home-container').style.display = 'block';
	document.getElementById('search-container').style.display = 'none';
	document.getElementById('profile-container').style.display = 'none';
	document.getElementById('share-container').style.display = 'none';
	const urlWithoutParams = window.location.href.split('?')[0];
  	window.history.replaceState({}, document.title, urlWithoutParams);
}

function search() {
	document.querySelector('.header').classList.remove('show-menu');
	document.getElementById('upload-container').style.display = 'none';
	document.getElementById('home-container').style.display = 'none';
	document.getElementById('search-container').style.display = 'block';
	document.getElementById('profile-container').style.display = 'none';
	document.getElementById('share-container').style.display = 'none';
	const urlWithoutParams = window.location.href.split('?')[0];
	window.history.replaceState({}, document.title, urlWithoutParams);
}

function profile() {
	document.querySelector('.header').classList.remove('show-menu');
	document.getElementById('upload-container').style.display = 'none';
	document.getElementById('home-container').style.display = 'none';
	document.getElementById('search-container').style.display = 'none';
	document.getElementById('profile-container').style.display = 'block';
	document.getElementById('share-container').style.display = 'none';
	displayUserMaps(firebase.auth().currentUser.uid);
	const urlWithoutParams = window.location.href.split('?')[0];
  	window.history.replaceState({}, document.title, urlWithoutParams);
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
		.get()
		.then(querySnapshot => {
			const mapList = document.getElementById('map-list');
			mapList.innerHTML = '';
			// Get the current user's UID
			// Check if the user is signed in before accessing the UID
			const currentUser = firebase.auth().currentUser;
			const currentUserUid = currentUser ? currentUser.uid : null;

			querySnapshot.forEach(doc => {
				const mapData = doc.data();
				const mapItem = document.createElement('div');
				mapItem.classList.add('map-card'); // Add a class for styling
    			mapItem.innerHTML = `
				<p><strong>Song Name:</strong> ${mapData.songName}</p>
				<p><strong>Artist:</strong> ${mapData.artist}</p>
				<a href="${mapData.downloadURL}" download class="download-button">Download Map</a>
				<button class="share-button" onclick="shareLink('${doc.id}')">
					<i class="fas fa-share"></i> Share
				</button>
				<div id="share-link-${doc.id}" class="share-link" style="display: none;"></div>`;
				mapList.appendChild(mapItem);
			});
		})
		.catch(error => {
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

let searchQuery; // Declare a global variable to store the search query
let currentLimit = 5; // Initialize the limit for the initial search

// Fetch and display the list of uploaded maps from Firestore based on search input
function searchMaps(searchInput, searchCriteria, limit) {
  const db = firebase.firestore();
  
  // Preprocess the search input for case-insensitive and punctuation-free search
  const searchInputLower = searchInput.toLowerCase().replace(/[^\w\s]/g, '');

  // Construct the query with the given limit
  searchQuery = db.collection('maps')
    .where(searchCriteria + 'Lower', '>=', searchInputLower)
    .where(searchCriteria + 'Lower', '<=', searchInputLower + '\uf8ff')
    .orderBy(searchCriteria + 'Lower') // Use the searchCriteria field here
    .orderBy('timestamp', 'desc') // Add this line to maintain the timestamp ordering
    .limit(limit);


  // Execute the query and return the results
  return searchQuery.get()
    .then(snapshot => {
      const searchResults = document.getElementById('search-results');
      const noResultsMessage = document.getElementById('no-results-message');
      searchResults.innerHTML = '';
      noResultsMessage.style.display = 'none'; // Hide the message initially

      const currentUser = firebase.auth().currentUser;
      const currentUserUid = currentUser ? currentUser.uid : null;
      
      if (snapshot.empty) {
        noResultsMessage.style.display = 'block'; // Show the message if no results are found
      } else {
        snapshot.forEach(doc => {
          const mapData = doc.data();
          const mapItem = document.createElement('div');
		  mapItem.classList.add('map-card');
          mapItem.innerHTML = `
				<p><strong>Song Name:</strong> ${mapData.songName}</p>
				<p><strong>Artist:</strong> ${mapData.artist}</p>
				<a href="${mapData.downloadURL}" download class="download-button">Download Map</a>
				<button class="share-button" onclick="shareLink('${doc.id}', 'search')">
					<i class="fas fa-share"></i> Share
				</button>
				<div id="share-search-link-${doc.id}" class="share-link" style="display: none;"></div>`;
          searchResults.appendChild(mapItem);
        });
      }
	  return snapshot;
    })
    .catch(error => {
      console.error('Error fetching search results:', error);
    });
}

let searchInput; // Define the searchInput variable
let searchCriteria;

const loadMoreButton = document.getElementById('load-more-button');
loadMoreButton.addEventListener('click', () => {
	currentLimit += 5; // Increase the limit by 5
	searchMaps(searchInput, searchCriteria, currentLimit)
	  .then(snapshot => {
		// Handle loading more results
		const numResults = snapshot.docs.length;
		if (numResults < currentLimit) {
		  loadMoreButton.style.display = 'none'; // Hide the "Load More" button
		}
	  })
	  .catch(error => {
		console.error('Error loading more results:', error);
	  });
  });

const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', e => {
  e.preventDefault();

  searchInput = document.getElementById('search-input').value.trim();
  searchCriteria = document.getElementById('search-criteria').value;

  if (searchInput == '') 
    return;
    
  const searchResults = document.getElementById('search-results');
  searchResults.innerHTML = ''; // Clear previous search results
  currentLimit = 5; // Reset the limit for a new search

  searchMaps(searchInput, searchCriteria, currentLimit) // Initial limit of 5 results
    .then(snapshot => {
      // Handle displaying the initial search results
      if (snapshot.docs.length < currentLimit) {
        loadMoreButton.style.display = 'none'; // Hide the "Load More" button if there are no more results
      } else {
        loadMoreButton.style.display = 'block'; // Display the "Load More" button
      }
    })
    .catch(error => {
      console.error('Error searching maps:', error);
    });
});

function updateFile(input) {

	if (input.files && input.files[0].size > (5 * 1024)) {
        alert("File too large. Max 5KB allowed.");
        input.value = null;
    }

	const fileInput = document.getElementById("map-file");
	const fileNameDisplay = document.getElementById("uploaded-file-name");
  
	if (fileInput.files.length > 0) {
	  fileNameDisplay.textContent = fileInput.files[0].name;
	} else {
	  fileNameDisplay.textContent = "(No file chosen)";
	}
}


function displayUserMaps(uid, limit = 5) {
	const db = firebase.firestore();
	
	let query = db.collection('maps')
	  .where('uploaderUID', '==', uid)
	  .orderBy('timestamp', 'desc')
	  .limit(limit);
	
	// Check if the query should be further limited based on the user's maps count
	if (limit === 5) {
	  query = query.limit(5);
	}
  
	query.get()
	  .then(snapshot => {
		const yourMapsList = document.getElementById('your-maps-list');
		const loadMoreButton = document.getElementById('load-more-user-maps-button');
		
		yourMapsList.innerHTML = '';
		
		snapshot.forEach(doc => {
		  const mapData = doc.data();
		  const mapItem = document.createElement('div');
		  mapItem.classList.add('map-card');
		  mapItem.innerHTML = `
			<p><strong>Song Name:</strong> ${mapData.songName}</p>
			<p><strong>Artist:</strong> ${mapData.artist}</p>
			<a class="download" href="${mapData.downloadURL}" download>Download Map</a>
			<button class="delete-button" onclick="deleteMap('${doc.id}', this.parentElement)">Delete</button>
			<button class="share-button" onclick="shareLink('${doc.id}', 'profile')">
				<i class="fas fa-share"></i> Share
			</button>
			<div id="share-profile-link-${doc.id}" class="share-link" style="display: none;"></div>`;
		  yourMapsList.appendChild(mapItem);
		});
  
		if (snapshot.docs.length < limit) {
		  loadMoreButton.style.display = 'none';
		} else {
		  loadMoreButton.style.display = 'block';
		  loadMoreButton.addEventListener('click', () => {
			limit += 5; // Increase the limit by 5
			displayUserMaps(uid, limit);
		  });
		}
	  })
	  .catch(error => {
		console.error('Error fetching user maps:', error);
	  });
  }
  
  function shareLink(mapId, page) {
	const shareableLink = `${window.location.href}?levelid=${mapId}`;
	var shareLinkDiv = document.getElementById(`share-link-${mapId}`);
	switch(page)
	{
		case "home":	
			shareLinkDiv = document.getElementById(`share-link-${mapId}`);
			break;
		case "search":
			shareLinkDiv = document.getElementById(`share-search-link-${mapId}`);
			break;
		case "profile":
			shareLinkDiv = document.getElementById(`share-profile-link-${mapId}`);
			break;
	}
	shareLinkDiv.style.display = 'block';
	shareLinkDiv.innerHTML = `Share this link: <a href="${shareableLink}">${shareableLink}</a>`;
  }
  
  function displayLevelDetails() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const levelId = urlParams.get('levelid');
	
	if (levelId) 
	{
		document.getElementById('home-container').style.display = 'none';
		const db = firebase.firestore();
		const levelDetailsContainer = document.getElementById('share-container');
		const levelDetails = document.getElementById('level-details');
	
		// Fetch level details using the levelId
		db.collection('maps').doc(levelId).get()
			.then(doc => {
			if (doc.exists) {
				const mapData = doc.data();
				levelDetails.innerHTML = `
				<p><strong>Song Name:</strong> ${mapData.songName}</p>
				<p><strong>Artist:</strong> ${mapData.artist}</p>
				<p><strong>Uploader:</strong> ${mapData.uploader}</p>
				<a href="${mapData.downloadURL}" download>Download Map</a>`;
				levelDetailsContainer.style.display = 'block'; // Display the section container
			} else {
				levelDetails.innerHTML = 'Level not found';
				levelDetailsContainer.style.display = 'block'; // Display the section container
			}
			})
			.catch(error => {
			console.error('Error fetching level details:', error);
			});
	}
}