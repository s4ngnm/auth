const fileUploadLimit = 2048576; // 1MB in bytes. Formula: 1MB = 1 * 1024 * 1024.
const localStorageKey = "images";
let imageData = [];

// Render image in HTML by adding to the unordered list.
function renderImage(imageObj, $imageCollection) {
  if (imageObj.file_base64.length) {
    $imageCollection.append("<li><img src=\"data:image/png;base64," + imageObj.file_base64 + "\"  width=\"200\" /><br />" + imageObj.name + "<br /><a href=\"#\" data-timestamp=\"" + imageObj.timestamp + "\" class=\"btn-delete\">Remove</a></li>")
  }
}

// Add image to local storage.
function addImage(imageObj) {
  imageData.push(imageObj);
  localStorage.setItem(localStorageKey, JSON.stringify(imageData));
}

// Remove image from local storage by timestamp.
function removeImage(timestamp) {
  // Remove item by the timestamp.
  imageData = imageData.filter(img => img.timestamp !== timestamp);

  // Update local storage.
  localStorage.setItem(localStorageKey, JSON.stringify(imageData));
}

// Read image data stored in local storage.
function getImages($imageCollection) {
  const localStorageData = localStorage.getItem(localStorageKey);

  if (localStorageData !== null) {
    imageData = JSON.parse(localStorage.getItem(localStorageKey))

    for (let i = 0; i < imageData.length; i++) {
      renderImage(imageData[i], $imageCollection);
    }
  }
}

// Delete button action to fire off deletion.
function deleteImageAction() {
  $(".btn-delete").on("click", function(e) {
    e.preventDefault();

    removeImage($(this).data("timestamp"));

    // Remove the HTML markup for this image.
    $(this).parent().remove();
  })
}

// Upload action to fire off file upload automatically.
function uploadChangeAction($upload, $imageCollection) {
  $upload.on("change", function(e) {
    e.preventDefault();

    // Ensure validation message is removed (if one is present).
    $upload.next("p").remove();

    const file = e.target.files[0];

    if (file.size <= fileUploadLimit) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result
          .replace('data:', '')
          .replace(/^.+,/, '');

        // Create an object containing image information.
        let imageObj = {
          name: "image-" + ($imageCollection.find("li").length + 1),
          timestamp: Date.now(),
          file_base64: base64String.toString()
        };

        // Add To Local storage
        renderImage(imageObj, $imageCollection)
        addImage(imageObj);

        deleteImageAction();

        // Clear upload element.
        $upload.val("");
      };

      reader.readAsDataURL(file);
    } else {
      $upload.after("<p>File too large</p>");
    }
  });
}

// Initialise.
$(document).ready(function() {
  getImages($("#image-collection"));

  // Set action events.
  uploadChangeAction($("#image-upload"), $("#image-collection"));
  deleteImageAction();
});
