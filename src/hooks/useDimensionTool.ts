import { useState, useCallback, useRef } from 'react'
import { useDesignStore } from '@/stores/designStore'
import { useUIStore } from '@/stores/uiStore'
import { DimensionAnnotation, createDimensionAnnotation, createAutoDimensions } from '@/components/Canvas/DimensionAnnotations'
import { snapPoint, getWallSnapPoints } from '@/utils/snapping'

interface DimensionToolState {
  annotations: DimensionAnnotation[]
  isCreating: boolean
  startPoint: { x: number; y: number } | null
  currentPoint: { x: number; y: number } | null
  showAll: boolean
  selectedId: string | null
  style: import('@/components/Canvas/DimensionAnnotations').DimensionStyle
}

export const useDimensionTool = () => {
  const [state, setState] = useState<DimensionToolState>({
    annotations: [],
    isCreating: false,
    startPoint: null,
    currentPoint: null,
    showAll: true,
    selectedId: null,
    style: {
      color: '#2563eb',
      strokeWidth: 1.5,
      fontSize: 12,
      arrowSize: 8,
      extensionLength: 20,
      textBackground: true,
      precision: 1,
      units: 'both',
    },
  })

  const { walls, doors, windows } = useDesignStore()
  const { activeTool, snapToGrid, gridSize } = useUIStore()
  const stateRef = useRef(state)
  stateRef.current = state

  const getSnapPoint = useCallback((x: number, y: number) => {
    const snapPoints = getWallSnapPoints(walls)

    doors.forEach(door => {
      const wall = walls.find(w => w.id === door.wallId)
      if (wall) {
        const wallLength = Math.sqrt(
          Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
        )
        const ratio = door.x / wallLength
        const doorX = wall.startX + (wall.endX - wall.startX) * ratio
        const doorY = wall.startY + (wall.endY - wall.startY) * ratio

        snapPoints.push(
          { x: doorX, y: doorY },
          {
            x: doorX + door.width * Math.cos(Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)),
            y: doorY + door.width * Math.sin(Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)),
          }
        )
      }
    })

    windows.forEach(window => {
      const wall = walls.find(w => w.id === window.wallId)
      if (wall) {
        const wallLength = Math.sqrt(
          Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
        )
        const ratio = window.x / wallLength
        const windowX = wall.startX + (wall.endX - wall.startX) * ratio
        const windowY = wall.startY + (wall.endY - wall.startY) * ratio

        snapPoints.push(
          { x: windowX, y: windowY },
          {
            x: windowX + window.width * Math.cos(Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)),
            y: windowY + window.width * Math.sin(Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)),
          }
        )
      }
    })

    return snapPoint({ x, y }, gridSize, snapPoints, snapToGrid)
  }, [walls, doors, windows, gridSize, snapToGrid])

  const startDimension = useCallback((x: number, y: number) => {
    if (activeTool !== 'dimension') return

    const snappedPoint = getSnapPoint(x, y)

    setState(prev => ({
      ...prev,
      isCreating: true,
      startPoint: snappedPoint,
      currentPoint: snappedPoint,
      selectedId: null,
    }))
  }, [activeTool, getSnapPoint])

  const updateDimension = useCallback((x: number, y: number) => {
    if (!stateRef.current.isCreating || activeTool !== 'dimension') return

    const snappedPoint = getSnapPoint(x, y)

    setState(prev => ({
      ...prev,
      currentPoint: snappedPoint,
    }))
  }, [activeTool, getSnapPoint])

  const finishDimension = useCallback(() => {
    const currentState = stateRef.current

    if (!currentState.isCreating || !currentState.startPoint || !currentState.currentPoint) {
      return
    }

    const distance = Math.sqrt(
      Math.pow(currentState.currentPoint.x - currentState.startPoint.x, 2) +
      Math.pow(currentState.currentPoint.y - currentState.startPoint.y, 2)
    )

    if (distance > 10) {
      const newAnnotation = createDimensionAnnotation(
        currentState.startPoint,
        currentState.currentPoint,
        {
          isPermanent: true,
          style: currentState.style,
        }
      )

      setState(prev => ({
        ...prev,
        annotations: [...prev.annotations, newAnnotation],
        isCreating: false,
        startPoint: null,
        currentPoint: null,
      }))
    } else {
      setState(prev => ({
        ...prev,
        isCreating: false,
        startPoint: null,
        currentPoint: null,
      }))
    }
  }, [])

  const cancelDimension = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreating: false,
      startPoint: null,
      currentPoint: null,
    }))
  }, [])

  const updateStyle = useCallback((style: import('@/components/Canvas/DimensionAnnotations').DimensionStyle) => {
    setState(prev => ({
      ...prev,
      style,
    }))
  }, [])

  const updateAnnotation = useCallback((annotations: DimensionAnnotation[]) => {
    setState(prev => ({
      ...prev,
      annotations,
    }))
  }, [])

  const deleteAnnotation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      annotations: prev.annotations.filter(a => a.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }))
  }, [])

  const clearAllAnnotations = useCallback(() => {
    setState(prev => ({
      ...prev,
      annotations: [],
      selectedId: null,
    }))
  }, [])

  const toggleShowAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAll: !prev.showAll,
    }))
  }, [])

  const autoDimensionWalls = useCallback(() => {
    const autoAnnotations = createAutoDimensions(walls)

    setState(prev => ({
      ...prev,
      annotations: [...prev.annotations, ...autoAnnotations],
    }))
  }, [walls])

  const autoDimensionSelected = useCallback(
    (elementIds: string[], elementType: 'wall' | 'door' | 'window') => {
      const newAnnotations: DimensionAnnotation[] = []

      elementIds.forEach(id => {
        let startPoint: { x: number; y: number } | undefined
        let endPoint: { x: number; y: number } | undefined

        if (elementType === 'wall') {
          const wall = walls.find(w => w.id === id)
          if (wall) {
            startPoint = { x: wall.startX, y: wall.startY }
            endPoint = { x: wall.endX, y: wall.endY }
          }
        } else if (elementType === 'door') {
          const door = doors.find(d => d.id === id)
          if (
            door &&
            typeof door.x === 'number' &&
            typeof door.width === 'number' &&
            door.wallId
          ) {
            const wall = walls.find(w => w.id === door.wallId)
            if (wall) {
              const wallLength = Math.sqrt(
                Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
              )
              const ratio = door.x / wallLength
              const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)
              startPoint = {
                x: wall.startX + (wall.endX - wall.startX) * ratio,
                y: wall.startY + (wall.endY - wall.startY) * ratio,
              }
              endPoint = {
                x: startPoint.x + door.width * Math.cos(angle),
                y: startPoint.y + door.width * Math.sin(angle),
              }
            }
          }
        } else if (elementType === 'window') {
          const win = windows.find(w => w.id === id)
          if (
            win &&
            typeof win.x === 'number' &&
            typeof win.width === 'number' &&
            win.wallId
          ) {
            const wall = walls.find(w => w.id === win.wallId)
            if (wall) {
              const wallLength = Math.sqrt(
                Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
              )
              const ratio = win.x / wallLength
              const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)
              startPoint = {
                x: wall.startX + (wall.endX - wall.startX) * ratio,
                y: wall.startY + (wall.endY - wall.startY) * ratio,
              }
              endPoint = {
                x: startPoint.x + win.width * Math.cos(angle),
                y: startPoint.y + win.width * Math.sin(angle),
              }
            }
          }
        }

        if (startPoint && endPoint) {
          const annotation = createDimensionAnnotation(startPoint, endPoint, {
            elementId: id,
            elementType,
            style: state.style,
          })
          newAnnotations.push(annotation)
        }
      })

      setState(prev => ({
        ...prev,
        annotations: [...prev.annotations, ...newAnnotations],
      }))
    },
    [walls, doors, windows, state.style]
  )

  const getCurrentDimension = useCallback(() => {
    if (!state.isCreating || !state.startPoint || !state.currentPoint) {
      return null
    }

    const distance = Math.sqrt(
      Math.pow(state.currentPoint.x - state.startPoint.x, 2) +
      Math.pow(state.currentPoint.y - state.startPoint.y, 2)
    )

    return {
      startPoint: state.startPoint,
      endPoint: state.currentPoint,
      distance,
      label: `${distance.toFixed(1)}cm`
    }
  }, [state.isCreating, state.startPoint, state.currentPoint])

  const selectAnnotation = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedId: id
    }))
  }, [])

  return {
    state,
    startDimension,
    updateDimension,
    finishDimension,
    cancelDimension,
    updateAnnotation,
    deleteAnnotation,
    clearAllAnnotations,
    toggleShowAll,
    autoDimensionWalls,
    autoDimensionSelected,
    getCurrentDimension,
    selectAnnotation,
    updateStyle
  }
}
