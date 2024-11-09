document.addEventListener('DOMContentLoaded', async () => {
  const alwaysOpenCheckbox = document.getElementById('always-open');
  const redirectCheckbox = document.getElementById('redirect-or-new');
  const jsonModeCheckbox = document.getElementById('json-mode');
  const keybindingInput = document.querySelector('.keybinding');
  const saveButton = document.querySelector('.save-settings');
  const resetButton = document.querySelector('.reset-defaults');

  // Define default values
  const defaults = {
    alwaysOpen: false,
    openInNewTab: true,
    jsonMode: false,
    keybinding: 'Ctrl+Alt+1'
  };
  // Load settings from storage and apply them to the form
  try {
    const data = await browser.storage.sync.get(Object.keys(defaults));
    console.log('Retrieved data:', data);
    alwaysOpenCheckbox.checked = data.alwaysOpen ?? defaults.alwaysOpen;
    redirectCheckbox.checked = data.openInNewTab ?? defaults.openInNewTab;
    jsonModeCheckbox.checked = data.jsonMode ?? defaults.jsonMode;
    keybindingInput.value = data.keybinding ?? defaults.keybinding;
  } catch (error) {
    console.error('Error retrieving settings:', error);
  }

  // Save settings to storage when Save button is clicked
  saveButton.addEventListener('click', () => {
    let keybinding = defaults.keybinding;
    if (keybindingInput.value) {
      keybinding = keybindingInput.value
    }
    
    browser.storage.sync.set({
      jsonMode: jsonModeCheckbox.checked,
      alwaysOpen: alwaysOpenCheckbox.checked,
      openInNewTab: redirectCheckbox.checked,
      keybinding: keybinding
    }, () => {
      console.log('Settings saved');
    });
  });

  // Reset settings to defaults when Reset button is clicked
  resetButton.addEventListener('click', () => {
    browser.storage.sync.set(defaults, () => {
      alwaysOpenCheckbox.checked = defaults.alwaysOpen;
      redirectCheckbox.checked = defaults.openInNewTab;
      jsonModeCheckbox.checked = defaults.jsonMode;
      keybindingInput.value = defaults.keybinding;
      console.log('Settings reset to defaults');
    });
  });
});