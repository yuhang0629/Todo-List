// Storage service that works in both Electron and web environments
const { ipcRenderer } = window.require ? window.require('electron') : {};

export const storage = {
  async loadTodos() {
    if (ipcRenderer) {
      // Electron environment - use file system
      try {
        return await ipcRenderer.invoke('load-todos');
      } catch (error) {
        console.error('Error loading todos from file:', error);
        return {};
      }
    } else {
      // Web environment - use localStorage
      try {
        const saved = localStorage.getItem('daily-todo-tasks');
        return saved ? JSON.parse(saved) : {};
      } catch (error) {
        console.error('Error loading todos from localStorage:', error);
        return {};
      }
    }
  },

  async saveTodos(todos) {
    if (ipcRenderer) {
      // Electron environment - save to file system
      try {
        return await ipcRenderer.invoke('save-todos', todos);
      } catch (error) {
        console.error('Error saving todos to file:', error);
        return false;
      }
    } else {
      // Web environment - save to localStorage
      try {
        localStorage.setItem('daily-todo-tasks', JSON.stringify(todos));
        return true;
      } catch (error) {
        console.error('Error saving todos to localStorage:', error);
        return false;
      }
    }
  },

  async getDataPath() {
    if (ipcRenderer) {
      try {
        return await ipcRenderer.invoke('get-data-path');
      } catch (error) {
        console.error('Error getting data path:', error);
        return 'localStorage';
      }
    }
    return 'localStorage';
  },

  async setAlwaysOnTop(alwaysOnTop) {
    if (ipcRenderer) {
      try {
        return await ipcRenderer.invoke('set-always-on-top', alwaysOnTop);
      } catch (error) {
        console.error('Error setting always on top:', error);
        return false;
      }
    }
    return false;
  },

  async resizeWindow(width, height) {
    if (ipcRenderer) {
      try {
        return await ipcRenderer.invoke('resize-window', { width, height });
      } catch (error) {
        console.error('Error resizing window:', error);
        return false;
      }
    }
    return false;
  }
};