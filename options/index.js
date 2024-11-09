document.addEventListener('DOMContentLoaded', () => {
    const alwaysOpenCheckbox = document.getElementById('always-open');
    const redirectCheckbox = document.getElementById('redirect-or-new');
    const keybindingInput = document.querySelector('.keybinding');
    const saveButton = document.querySelector('.save-settings');
    const resetButton = document.querySelector('.reset-defaults');
  
    // Load settings from storage and apply them to the form
    browser.storage.sync.get(['alwaysOpen', 'openInNewTab', 'keybinding'], (data) => {
      alwaysOpenCheckbox.checked = data.alwaysOpen ?? false;
      redirectCheckbox.checked = data.openInNewTab ?? true;
      keybindingInput.value = data.keybinding ?? 'Ctrl+Alt+1';
    });
  
    // Save settings to storage when Save button is clicked
    saveButton.addEventListener('click', () => {
      browser.storage.sync.set({
        alwaysOpen: alwaysOpenCheckbox.checked,
        openInNewTab: redirectCheckbox.checked,
        keybinding: keybindingInput.value
      }, () => {
        console.log('Settings saved');
      });
    });
  
    // Reset settings to defaults when Reset button is clicked
    resetButton.addEventListener('click', () => {
      // Define default values
      const defaults = {
        alwaysOpen: false,
        openInNewTab: true,
        keybinding: 'Ctrl+Alt+1'
      };
  
      browser.storage.sync.set(defaults, () => {
        alwaysOpenCheckbox.checked = defaults.alwaysOpen;
        redirectCheckbox.checked = defaults.openInNewTab;
        keybindingInput.value = defaults.keybinding;
        console.log('Settings reset to defaults');
      });
    });
  });
  