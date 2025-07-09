export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  try {
    const result = await chrome.storage.local.get(key)
    return result[key] || null
  } catch (error) {
    console.error('Error getting storage item:', error)
    return null
  }
}

export const setStorageItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    await chrome.storage.local.set({ [key]: value })
  } catch (error) {
    console.error('Error setting storage item:', error)
    throw error
  }
}

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await chrome.storage.local.remove(key)
  } catch (error) {
    console.error('Error removing storage item:', error)
    throw error
  }
}

export const getMultipleStorageItems = async <T extends Record<string, unknown>>(
  keys: string[],
): Promise<T> => {
  try {
    const result = await chrome.storage.local.get(keys)
    return result as T
  } catch (error) {
    console.error('Error getting multiple storage items:', error)
    return {} as T
  }
}

export const setMultipleStorageItems = async <T extends Record<string, unknown>>(
  items: T,
): Promise<void> => {
  try {
    await chrome.storage.local.set(items)
  } catch (error) {
    console.error('Error setting multiple storage items:', error)
    throw error
  }
}

export const addStorageChangeListener = (
  callback: (changes: Record<string, chrome.storage.StorageChange>) => void,
): (() => void) => {
  chrome.storage.onChanged.addListener(callback)
  return () => chrome.storage.onChanged.removeListener(callback)
}

export const clearStorage = async (): Promise<void> => {
  try {
    await chrome.storage.local.clear()
  } catch (error) {
    console.error('Error clearing storage:', error)
    throw error
  }
}
