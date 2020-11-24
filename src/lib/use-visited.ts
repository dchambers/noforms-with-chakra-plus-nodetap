import { useState } from 'react'

const useVisited = () => {
  const [visited, setVisited] = useState<Record<string, boolean>>({})
  const hasvisited = (name: string): boolean => visited[name]
  const recordVisit = (name: string) => {
    setVisited({
      ...visited,
      [name]: true,
    })
  }

  return [hasvisited, recordVisit] as const
}

export default useVisited
