type Filter = (
  key: string,
  value: unknown,
  path: string[],
  ancestors: unknown[]
) => boolean

const objectFilter = <T>(
  object: T,
  filter: Filter,
  seenObjects: WeakSet<Record<string, unknown>> = new WeakSet(),
  path: string[] = [],
  ancestors: unknown[] = []
): T => {
  const obj = object as Record<string, unknown>

  return Object.keys(obj).reduce((acc, key) => {
    const item = obj[key]

    if (typeof item !== 'object') {
      const removeItem = filter(key, item, path, ancestors)

      if (!removeItem) {
        acc[key] = item
      }
    } else {
      const objItem = item as Record<string, unknown>

      if (!seenObjects.has(objItem)) {
        seenObjects.add(objItem)

        const removeItem = filter(key, objItem, path, ancestors)

        if (!removeItem) {
          acc[key] = objectFilter(
            objItem,
            filter,
            seenObjects,
            [key, ...path],
            [item, ...ancestors]
          )
        }
      }
    }

    return acc
  }, (Array.isArray(obj) ? [] : {}) as Record<string, unknown>) as T
}

export default objectFilter
