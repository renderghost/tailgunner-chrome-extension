chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      window.dispatchEvent(new CustomEvent('toggle-tailwind-panel'));
    }
  });
});

