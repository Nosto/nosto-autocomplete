import { findAll } from './dom'

export function bindInput(
    selector: string | HTMLInputElement,
    callbacks: {
        onSubmit?: (value: string) => void
        onSubmitButton?: (value: string) => void
        onInput?: (value: string) => void
        onFocus?: (value: string) => void
        onBlur?: (value: string) => void
        onKeyDown?: (value: string, key: string) => void
        onClick?: (value: string) => void
    },
): {
    destroy: () => void
} {
    const target =
        selector instanceof HTMLInputElement
            ? [selector]
            : findAll(selector, HTMLInputElement)
    const unbindCallbacks = target.flatMap((el) => {
        const cbs: Array<() => void> = []

        if (callbacks.onSubmit) {
            const onKeyDown = (event: KeyboardEvent) => {
                callbacks.onKeyDown?.(el.value, event.key)
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault()
                }

                if (event.key === 'Enter') {
                    if (el.value !== '' && !event.repeat) {
                        callbacks.onSubmit?.(el.value)
                    }
                    event.preventDefault()
                }
            }

            el.addEventListener('keydown', onKeyDown)
            cbs.push(() => {
                el.removeEventListener('keydown', onKeyDown)
            })

            const form = el.form

            if (form) {
                const onSubmit = (event: SubmitEvent) => {
                    event.preventDefault()
                    callbacks.onSubmit?.(el.value)
                }
                form.addEventListener('submit', onSubmit)
                cbs.push(() => {
                    form?.removeEventListener('submit', onSubmit)
                })
            }
        }

        if (callbacks.onSubmitButton) {
            const form = el.form

            if (form) {
                const buttons = findAll(form.querySelectorAll('[type=submit]'))
                buttons.forEach((button) => {
                    const onClick = (event: Event) => {
                        event.preventDefault()
                        callbacks.onSubmit?.(el.value)
                    }

                    button.addEventListener('click', onClick)
                    cbs.push(() => {
                        button.removeEventListener('click', onClick)
                    })
                })
            }
        }

        if (callbacks.onClick) {
            const onClick = () => {
                callbacks.onClick?.(el.value)
            }
            el.addEventListener('click', onClick)
        }

        if (callbacks.onFocus) {
            const onFocus = () => {
                callbacks.onFocus?.(el.value)
            }
            el.addEventListener('focus', onFocus)
        }

        if (callbacks.onInput) {
            const onInput = () => {
                callbacks.onInput?.(el.value)
            }

            el.addEventListener('input', onInput)
            cbs.push(() => {
                el.removeEventListener('input', onInput)
            })
        }

        return cbs
    })

    return {
        destroy() {
            unbindCallbacks.forEach((v) => v())
        },
    }
}
