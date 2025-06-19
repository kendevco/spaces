/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param source
 */
export default function deepMerge<
  T extends Record<string, unknown>,
  R extends Record<string, unknown>,
>(target: T, source: R): T & R {
  const output = { ...target } as T & R

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (isObject(sourceValue)) {
        if (!(key in target)) {
          Object.assign(output, { [key]: sourceValue })
        } else if (isObject(targetValue)) {
          output[key as keyof (T & R)] = deepMerge(targetValue, sourceValue) as (T & R)[keyof (T &
            R)]
        } else {
          Object.assign(output, { [key]: sourceValue })
        }
      } else {
        Object.assign(output, { [key]: sourceValue })
      }
    })
  }

  return output
}
