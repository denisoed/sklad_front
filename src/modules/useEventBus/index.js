import { ref } from 'vue'
import BUS_EVENTS from './events'

// Global event bus for cross-component communication
const eventBus = ref(new Map())

export default function useEventBus() {
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  function onBus(event, callback) {
    if (!eventBus.value.has(event)) {
      eventBus.value.set(event, [])
    }
    
    const callbacks = eventBus.value.get(event)
    callbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Emit an event with data
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  function emitBus(event, data) {
    const callbacks = eventBus.value.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event callback:', error)
        }
      })
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  function offBus(event) {
    eventBus.value.delete(event)
  }

  /**
   * Remove all event listeners
   */
  function clearAllBus() {
    eventBus.value.clear()
  }

  return {
    onBus,
    emitBus,
    offBus,
    clearAllBus,
    BUS_EVENTS
  }
} 