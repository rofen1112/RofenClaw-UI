const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),
  checkGateway: () => ipcRenderer.invoke('gateway:check'),
  gatewayChat: (message) => ipcRenderer.invoke('gateway:chat', message),
  getLogs: () => ipcRenderer.invoke('logs:get'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  getAppPath: () => ipcRenderer.invoke('app:getPath'),
})
