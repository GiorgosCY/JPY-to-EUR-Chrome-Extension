chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "getSelectedText") {
      sendResponse({ text: window.getSelection().toString() });
    }
  });
  