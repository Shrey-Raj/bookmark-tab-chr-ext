//sending notification
function notify(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Bookmark a Tab",
    message,
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addBookmark") {
    // Create a promise for adding the bookmark
    const addBookmarkPromise = new Promise(async (resolve, reject) => {
      try {
        const [tab] = await chrome.tabs.query({active: true,currentWindow: true});

        const title = tab.title || undefined ;
        const url   = tab.url || undefined ;

        chrome.bookmarks.create({ title, url }, (bookmark) => {
          const action = `Bookmarked!\nTitle: ${title}\nURL: ${url}`;
          notify(action);
          resolve(action);
        });
      } catch (error) {
        reject(error);
      }
    });

    addBookmarkPromise
      .then((response) => {
        sendResponse({ action: response });
      })
      .catch((error) => {
        console.log("Error:", error);
        sendResponse({ error: "An error occurred while bookmarking." });
      });

    return true; 
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "removeBookmark") {
    const removeBookmarkPromise = new Promise((resolve, reject) => {
      chrome.bookmarks.remove(message.bookmarkId, () => {
        notify("Bookmark removed successfully.");
        const message = "Bookmark removed!";
        resolve(message);
      });
    });

    removeBookmarkPromise
      .then((response) => {
        sendResponse({ action: response });
      })
      .catch((error) => {
        console.log("Error:", error);
        sendResponse({ error: "An error occurred while removing the bookmark." });
      });

    return true;
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getBookmarks") {
    new Promise(async (resolve, reject) => {

      const bookmarkTree = await new Promise((resolve) => {
        chrome.bookmarks.getTree((tree) => {
          resolve(tree);
        });
      });

      const otherBookmarks = bookmarkTree[0].children[1].children.map(
        (bookmark, index) => {
          let data = {};
          data.url = bookmark.url || "Folder";
          data.title = bookmark.title;
          return data;
        }
      );

      console.log("otherBookmarks: ", otherBookmarks);
      resolve(otherBookmarks);
    })
      .then((response) => {
        sendResponse(response);
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({
          error: "An error occurred while retrieving bookmarks.",
        });
      });

    return true;
  }
});
