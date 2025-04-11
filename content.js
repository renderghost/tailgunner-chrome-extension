(function () {
  // Debug mode for development
  const DEBUG = false;
  
  // Panel reference
  let panel;
  let resizeDebounceTimer = null;
  
  // Initialize content script
  function initialize() {
    try {
      console.log('Tailginner: Content script initialized');
      setupMessageListener();
    } catch (error) {
      console.error('Tailginner: Initialization failed:', error.message);
    }
  }
  
  function log(...args) {
    if (DEBUG) {
      console.log('Tailginner:', ...args);
    }
  }

  // Tailwind breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  /**
   * Determines the Tailwind breakpoint based on viewport width
   * @param {number} width - The viewport width
   * @returns {string} The breakpoint name
   */
  function getBreakpoint(width) {
    if (!width || typeof width !== 'number' || width < 0) {
      console.warn('Tailginner: Invalid viewport width:', width);
      return 'unknown';
    }
    
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'none';
  }

  /**
   * Creates and appends the panel to the document
   * @returns {Object|null} Panel elements or null on error
   */
  function createPanel() {
    try {
      log('Creating panel');
      
      // Ensure we're in a proper DOM context
      if (!document || !document.body) {
        throw new Error('Document or body is not available');
      }
      
      // Create main container
      const el = document.createElement('div');
      el.setAttribute('id', 'tailginner-panel');
      el.setAttribute('style', `
      position: fixed;
      bottom: 16px;
      right: 16px;
      background: rgba(33, 33, 33, 0.9);
      color: #ffffff;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 9999;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(2px);
      transition: opacity 0.2s ease;
    `);
    const viewportDiv = document.createElement('div');
    const breakpointDiv = document.createElement('div');
    viewportDiv.setAttribute('style', 'margin-bottom: 6px; font-weight: 400;');
    breakpointDiv.setAttribute('style', 'font-weight: 500;');

    el.appendChild(viewportDiv);
    el.appendChild(breakpointDiv);
    
    // Safely append to document
    try {
      document.body.appendChild(el);
      log('Panel created successfully');
      return { el, viewportDiv, breakpointDiv };
    } catch (appendError) {
      console.error('Tailginner: Failed to append panel to document:', appendError.message);
      return null;
    }
    
    } catch (error) {
      console.error('Tailginner: Failed to create panel:', error.message);
      return null;
    }
  }

  /**
   * Updates the panel with current viewport information
   * @param {Object} panelParts - The panel elements
   * @returns {boolean} Success status
   */
  function updatePanel(panelParts) {
    try {
      // Validate panel parts
      if (!panelParts || !panelParts.viewportDiv || !panelParts.breakpointDiv) {
        throw new Error('Invalid panel structure');
      }
      
      // Get viewport dimensions with edge case handling
      const width = Math.max(0, Math.round(window.innerWidth || document.documentElement.clientWidth || 0));
      const height = Math.max(0, Math.round(window.innerHeight || document.documentElement.clientHeight || 0));
      
      // Get breakpoint
      const bp = getBreakpoint(width);
      
      log(`Updating panel: ${width}×${height} (${bp})`);
      
      // Update DOM safely
      try {
        panelParts.viewportDiv.innerHTML = `<span style="opacity: 0.8;">Viewport:</span> <strong>${width}</strong> × <strong>${height}</strong>`;
        panelParts.breakpointDiv.innerHTML = `<span style="opacity: 0.8;">Breakpoint:</span> <strong style="color: #38bdf8;">${bp}</strong>`;
        return true;
      } catch (domError) {
        console.error('Tailginner: DOM update failed:', domError.message);
        return false;
      }
    } catch (e) {
      console.error('Tailginner: Error updating panel:', e.message);
      
      // Attempt to clean up on critical errors
      if (panel) {
        try {
          cleanupPanel();
        } catch (cleanupError) {
          console.warn('Tailginner: Cleanup after error failed:', cleanupError.message);
        }
      }
      return false;
    }
  }

  /**
   * Cleans up panel and event listeners
   */
  function cleanupPanel() {
    log('Cleaning up panel');
    
    if (panel && panel.el) {
      try {
        panel.el.remove();
      } catch (error) {
        console.warn('Tailginner: Error removing panel element:', error.message);
      }
    }
    
    window.removeEventListener('resize', resizeHandler);
    
    if (resizeDebounceTimer) {
      clearTimeout(resizeDebounceTimer);
      resizeDebounceTimer = null;
    }
    
    panel = null;
  }
  
  /**
   * Toggles the panel visibility
   * @returns {Object} Result object with success/error information
   */
  function togglePanel() {
    try {
      if (panel) {
        log('Hiding panel');
        cleanupPanel();
        return { success: true, action: 'hide' };
      } else {
        log('Showing panel');
        panel = createPanel();
        
        if (panel) {
          updatePanel(panel);
          window.addEventListener('resize', resizeHandler);
          return { success: true, action: 'show' };
        } else {
          const errorMsg = 'Failed to create panel';
          console.error('Tailginner: ' + errorMsg);
          return { success: false, error: errorMsg };
        }
      }
    } catch (error) {
      console.error('Tailginner: Error toggling panel:', error.message);
      // Ensure cleanup on error
      cleanupPanel();
      return { success: false, error: error.message };
    }
  }

  /**
   * Handles window resize events with debouncing
   */
  function resizeHandler() {
    if (!panel) return;
    
    // Use immediate update for responsive feel
    updatePanel(panel);
    
    // Debounce frequent updates
    if (resizeDebounceTimer) {
      clearTimeout(resizeDebounceTimer);
    }
    
    resizeDebounceTimer = setTimeout(() => {
      if (panel) {
        updatePanel(panel);
      }
      resizeDebounceTimer = null;
    }, 100);
  }
  
  /**
   * Sets up Chrome runtime message listener
   */
  function setupMessageListener() {
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
          log('Received message:', message);
          
          // Validate message
          if (!message || typeof message !== 'object') {
            sendResponse({ success: false, error: 'Invalid message format' });
            return true; // Keep message channel open for async response
          }
          
          // Handle different message actions
          if (message.action === 'toggle-panel') {
            const result = togglePanel();
            sendResponse(result);
          } else {
            sendResponse({ success: false, error: 'Unknown action' });
          }
        } catch (error) {
          console.error('Tailginner: Error processing message:', error.message);
          sendResponse({ success: false, error: error.message });
        }
        
        return true; // Keep message channel open for async response
      });
      
      log('Message listener registered');
    } catch (error) {
      console.error('Tailginner: Failed to set up message listener:', error.message);
    }
  }
  
  // Start the extension
  initialize();
})();

