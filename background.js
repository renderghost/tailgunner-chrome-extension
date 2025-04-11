// Log extension initialization for debugging
console.log('Tailginner extension initialized');

/**
 * Toggles the Tailwind panel in the active tab
 * @param {chrome.tabs.Tab} tab - The active browser tab
 */
function toggleTailwindPanel(tab) {
  // Validate tab object and ID
  if (!tab) {
    console.error('Tailginner: No active tab found');
    return;
  }
  
  if (!tab.id) {
    console.error('Tailginner: Invalid tab ID');
    return;
  }
  
  // Check for restricted URLs where content scripts can't run
  if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
    console.warn(`Tailginner: Cannot access restricted page: ${tab.url.substring(0, 30)}...`);
    return;
  }
  
  // Send message to content script with proper error handling
  try {
    chrome.tabs.sendMessage(
      tab.id, 
      { action: 'toggle-panel' },
      (response) => {
        // Handle response from content script
        if (chrome.runtime.lastError) {
          console.warn('Tailginner: Error sending message:', chrome.runtime.lastError.message);
          return;
        }
        
        if (response) {
          if (response.success) {
            console.log('Tailginner: Panel toggled successfully');
          } else if (response.error) {
            console.warn('Tailginner: Content script reported an error:', response.error);
          }
        }
      }
    );
  } catch (error) {
    console.error('Tailginner: Fatal error:', error.message);
  }
}

// Register the click handler
chrome.action.onClicked.addListener(toggleTailwindPanel);

