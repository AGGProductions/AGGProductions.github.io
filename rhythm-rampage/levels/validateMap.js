// Define a function to remove the map file and show an alert
function removeMapFileInput(inputElement) {
  inputElement.value = null; // Clear the selected file
  const fileNameDisplay = document.getElementById("uploaded-file-name");
  if (inputElement.files.length > 0) {
	  fileNameDisplay.textContent = inputElement.files[0].name;
	} else {
	  fileNameDisplay.textContent = "(No file chosen)";
	}
}

// Define a function to validate the uploaded map
function validateMapFile(mapFile) {
  const zip = new JSZip();

  // Load the zip file
  return zip.loadAsync(mapFile)
    .then(zip => {
      // Get the JSON file
      const jsonFile = zip.file('level.json');

      if (!jsonFile) {
        removeMapFileInput(mapFileInput); // Remove the file and alert the user
        throw new Error('Missing level.json in the zip file.');
      }

      // Read and parse the JSON file
      return jsonFile.async('string')
        .then(jsonString => {
          const mapData = JSON.parse(jsonString);

          // Validate JSON structure
          if (!mapData.levelInfo || !mapData.levelData) {
            removeMapFileInput(mapFileInput); // Remove the file and alert the user
            throw new Error('Invalid JSON structure in level.json.');
          }

          // Validate levelInfo properties
          const { songArtist, uploaderName, levelVersion } = mapData.levelInfo;
          if (typeof songArtist !== 'string' || typeof uploaderName !== 'string' || !/^(\d+\.)?(\d+\.)?(\d+)$/.test(levelVersion)) {
            removeMapFileInput(mapFileInput); // Remove the file and alert the user
            throw new Error('Invalid levelInfo properties.');
          }

          // Validate levelData properties
          const { songDelay, noteTime, coverLink, audioLink, midNames, difficulties } = mapData.levelData;
          if (typeof songDelay !== 'number' || songDelay < 0 ||
              typeof noteTime !== 'number' || noteTime <= 0 ||
              typeof coverLink !== 'string' || !coverLink.startsWith('https://coverartarchive.org/release/') || !/^https:\/\/www\.youtube\.com\/watch/.test(audioLink) ||
              !Array.isArray(midNames) || midNames.length === 0 || midNames.length > 4 ||
              !midNames.every(name => typeof name === 'string') ||
              new Set(midNames).size !== midNames.length ||
              !midNames.every(name => {
                const file = zip.file(name);
                return typeof name === 'string' && file !== null;
              }) ||
              !Array.isArray(difficulties) || difficulties.length > 4 ||
              !difficulties.every(difficulty => Number.isInteger(difficulty) && difficulty > 0 && difficulty <= 4) ||
              difficulties.length !== midNames.length) {
            removeMapFileInput(mapFileInput); // Remove the file and alert the user
            throw new Error('Invalid levelData properties.');
          }

          // Perform more validation checks as needed

          return mapData;
        });
    });
}

// Example usage:
const mapFileInput = document.getElementById('map-file');
mapFileInput.addEventListener('change', async (event) => {
  const mapFile = event.target.files[0];

  try {
    const validatedMapData = await validateMapFile(mapFile);
    console.log('Map data is valid:', validatedMapData);
    // Proceed with map upload or other actions
  } catch (error) {
    console.error('Error validating map:', error);
    // Display an error message to the user
    alert("Invalid level file. Please select a valid level file. \n" + error);
  }
});
