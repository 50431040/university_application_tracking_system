"use client"

import { useState, useCallback } from 'react'
import type { LoadingState, ApiResponse } from '@/types'

export function useAsyncOperation<T>() {
  const [state, setState] = useState<LoadingState<T>>({
    data: null,
    isLoading: false,
    error: null
  })

  const execute = useCallback(async (
    operation: () => Promise<ApiResponse<T>>
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await operation()
      
      if (response.error) {
        setState({
          data: null,
          isLoading: false,
          error: response.error.message
        })
      } else {
        setState({
          data: response.data || null,
          isLoading: false,
          error: null
        })
      }
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : '未知错误'
      })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}