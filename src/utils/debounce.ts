export default function (delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let leadingExecuted = false

  return (callback: () => void) => {
    if (!leadingExecuted) {
      callback()
      leadingExecuted = true
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(async () => {
        await callback()
        leadingExecuted = false
      }, delay)
    }
  }
}
