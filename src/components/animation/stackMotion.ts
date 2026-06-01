import { useEffect, useMemo, useRef } from 'react'

export const getNewItemIds = (
  previousIds: string[],
  currentIds: string[],
): string[] => {
  const previousIdSet = new Set(previousIds)

  return currentIds.filter((id) => !previousIdSet.has(id))
}

export const useNewItemIds = (currentIds: string[]): Set<string> => {
  const previousIdsRef = useRef<string[]>(currentIds)

  const newIds = useMemo(
    () => getNewItemIds(previousIdsRef.current, currentIds),
    [currentIds],
  )

  useEffect(() => {
    previousIdsRef.current = currentIds
  }, [currentIds])

  return useMemo(() => new Set(newIds), [newIds])
}
