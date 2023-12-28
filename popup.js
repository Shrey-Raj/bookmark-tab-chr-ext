document.addEventListener("DOMContentLoaded", function () {
  const addBookmarkButton = document.getElementById("addBookmark");
  const removeBookmarkButton = document.getElementById("removeBookmark");
  const viewBookmarksButton = document.getElementById("viewBookmarks");
  const outputDiv = document.getElementById("output");

  // Adding a bookmark
  addBookmarkButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "addBookmark" }, (response) => {
      if ( response && response.error) {
        outputDiv.textContent = "Error: " + response.error;
      } else {
        console.log(response) ;
        outputDiv.textContent = `${response.action}` ;
      }
    });
  });

  // Removing a bookmark
  removeBookmarkButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        const tabUrl = tab.url;
  
        chrome.bookmarks.search({ url: tabUrl }, (results) => {
          if (results.length > 0) {
            const bookmarkId = results[0].id;
  
            chrome.runtime.sendMessage({ action: "removeBookmark", bookmarkId }, (response) => {
              if (response && response.error) {
                outputDiv.textContent = "Error: " + response.error;
              } else {
                outputDiv.textContent = `${response.action}`;
              }
            });
          } else {
            outputDiv.textContent = "Bookmark not found for this tab.";
          }
        });
      } else {
        outputDiv.textContent = "No active tab found.";
      }
    });
  });
  

  // Viewing bookmarks
  viewBookmarksButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "getBookmarks" }, (response) => {
      if (response && response.error) {
        outputDiv.textContent = "Error: " + response.error;
      } else {
        console.log(response , 'from Popup.js') ;
        displayBookmarks(response) ; 
      }
    });
  });
  
function displayBookmarks(bookmarks) {
  outputDiv.innerHTML = "";

  bookmarks.forEach((bookmark) => {
    const bookmarkElement = document.createElement("div");
    bookmarkElement.classList.add("bookmark");
    bookmarkElement.innerHTML = `<span class="title">${bookmark.title}</span><br><a class="url" href="${bookmark.url}" target="_blank">${bookmark.url}</a>`;
    outputDiv.appendChild(bookmarkElement);
  });
}


});

