type Callbacks = {
  onSubmit?: (value: string) => void
  onInput?: (value: string) => void
  onFocus?: (value: string) => void
  onBlur?: (value: string) => void
  onKeyDown?: (value: string, key: string) => void
  onClick?: (value: string) => void
}

export function disableNativeAutocomplete(target: HTMLInputElement) {
  target.setAttribute("autocomplete", "off")
}

export function bindInput(
  target: HTMLInputElement,
  callbacks: Callbacks
): {
  destroy: () => void
} {
  const unbindCallbacks = [target].flatMap(el => {
    const cbs: Array<() => void> = []

    if (callbacks.onSubmit) {
      const onKeyDown = (event: KeyboardEvent) => {
        callbacks.onKeyDown?.(el.value, event.key)
        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "Enter"
        ) {
          event.preventDefault()
        }
      }

      el.addEventListener("keydown", onKeyDown)
      cbs.push(() => {
        el.removeEventListener("keydown", onKeyDown)
      })

      const form = el.form

      if (form) {
        const onSubmit = (event: SubmitEvent) => {
          event.preventDefault()
          callbacks.onSubmit?.(el.value)
        }
        form.addEventListener("submit", onSubmit)
        cbs.push(() => {
          form?.removeEventListener("submit", onSubmit)
        })

        const buttons = Array.from(form.querySelectorAll("[type=submit]"))
        buttons.forEach(button => {
          const onClick = (event: Event) => {
            event.preventDefault()
            callbacks.onSubmit?.(el.value)
          }

          button.addEventListener("click", onClick)
          cbs.push(() => {
            button.removeEventListener("click", onClick)
          })
        })
      }
    }

    if (callbacks.onClick) {
      const onClick = () => {
        callbacks.onClick?.(el.value)
      }
      el.addEventListener("click", onClick)
    }

    if (callbacks.onFocus) {
      const onFocus = () => {
        callbacks.onFocus?.(el.value)
      }
      el.addEventListener("focus", onFocus)
    }

    if (callbacks.onInput) {
      const onInput = () => {
        callbacks.onInput?.(el.value)
      }

      el.addEventListener("input", onInput)
      cbs.push(() => {
        el.removeEventListener("input", onInput)
      })
    }

    return cbs
  })

  return {
    destroy() {
      unbindCallbacks.forEach(v => v())
    },
  }
}
