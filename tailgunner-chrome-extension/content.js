(function () {
  let panel;

  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  function getBreakpoint(width) {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'none';
  }

  function createPanel() {
    const el = document.createElement('div');
    el.setAttribute('id', 'tailwind-helper-panel');
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
    document.body.appendChild(el);
    return { el, viewportDiv, breakpointDiv };
  }

  function updatePanel(panelParts) {
    try {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const bp = getBreakpoint(width);

      panelParts.viewportDiv.innerHTML = `<span style="opacity: 0.8;">Viewport:</span> <strong>${width}</strong> × <strong>${height}</strong>`;
      panelParts.breakpointDiv.innerHTML = `<span style="opacity: 0.8;">Breakpoint:</span> <strong style="color: #38bdf8;">${bp}</strong>`;
    } catch (e) {
      console.warn('[Tailginner] Error updating panel:', e);
    }
  }

  function togglePanel() {
    if (panel) {
      panel.el.remove();
      window.removeEventListener('resize', resizeHandler);
      panel = null;
    } else {
      panel = createPanel();
      updatePanel(panel);
      window.addEventListener('resize', resizeHandler);
    }
  }

  function resizeHandler() {
    if (panel) updatePanel(panel);
  }

  window.addEventListener('toggle-tailwind-panel', togglePanel);
})();

