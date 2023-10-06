import { AnyPromise } from './utils/promise'

export class Dropdown<State> {
    private elements: HTMLElement[] = []
    private unbindCallbacks: Array<() => void> = []

    protected isEmpty: boolean = true
    protected selectedIndex: number = -1

    constructor(
        public container: HTMLElement,
        protected initialState: PromiseLike<State>,
        protected render: (
            container: HTMLElement,
            state: State,
        ) => void | PromiseLike<void>,
        protected submit: (inputValue: string) => unknown,
        protected updateInput: (inputValue: string) => void,
        protected onClickBindings?: {
            [key: string]: (
                data: string | undefined,
                el: HTMLElement,
            ) => PromiseLike<State> | undefined
        },
    ) {
        AnyPromise.resolve(initialState)
            .then((state) => this.render(this.container, state as State))
            .then(() => {
                // Without setTimeout React does not have committed DOM changes yet, so we don't have the correct elements.
                setTimeout(() => {
                    this.loadElements()
                    this.bindDataCallbacks()
                    this.hide()
                }, 0)
            })
    }

    private handleElementSubmit(el: HTMLElement): void {
        const hit = el?.dataset?.nsHit

        if (hit) {
            try {
                const parsedHit = JSON.parse(hit)
                this.hide()

                if (parsedHit.item) {
                    this.submit(parsedHit.item)
                    return
                }

                if (parsedHit.keyword) {
                    this.submit(parsedHit.keyword)
                    return
                }

                if (parsedHit.url) {
                    location.href = parsedHit.url
                }
            } catch (error) {
                console.error('Could not parse [data-ns-hit]', error)
            }
        }
    }

    private loadElements() {
        this.isEmpty = !this.container.innerHTML.trim()

        if (!this.isEmpty) {
            this.elements = Array.from<HTMLElement>(
                this.container.querySelectorAll('[data-ns-hit]'),
            ).map((el) => {
                this.bindElementSubmit(el)
                return el
            })
        }
    }

    private bindDataCallbacks() {
        Object.entries(this.onClickBindings ?? {}).map(([key, callback]) => {
            // Convert camelCase to kebab-case
            const dataKey = `[data-ns-${key
                .replace(/([A-Z])/g, '-$1')
                .toLowerCase()}]`

            Array.from<HTMLElement>(
                this.container.querySelectorAll(dataKey),
            ).map((el) => {
                const data =
                    el?.dataset?.[
                        `ns${key.charAt(0).toUpperCase() + key.slice(1)}`
                    ]
                const onClick = () => {
                    callback(data, el)?.then((state) => this.update(state))
                }
                el.addEventListener('click', onClick)
                this.unbindCallbacks.push(() => {
                    el.removeEventListener('click', onClick)
                })
            })
        })
    }

    private bindElementSubmit(el: HTMLElement): void {
        const onSubmit = () => {
            this.handleElementSubmit(el)
        }

        el.addEventListener('click', onSubmit)
        this.unbindCallbacks.push(() => {
            el.removeEventListener('click', onSubmit)
        })
    }

    private highlight(index: number, prevIndex?: number): void {
        if (typeof prevIndex === 'number' && this.elements[prevIndex]) {
            this.elements[prevIndex].classList.remove('selected')
        }

        if (typeof index === 'number' && this.elements[index]) {
            this.elements[index]?.classList.add('selected')

            const hit = this.elements[index]?.dataset?.nsHit

            if (hit) {
                try {
                    const parsedHit = JSON.parse(hit)

                    if (parsedHit.item) {
                        this.updateInput(parsedHit.item)
                        return
                    }

                    if (parsedHit.keyword) {
                        this.updateInput(parsedHit.keyword)
                        return
                    }
                } catch (error) {
                    console.error('Could not parse [data-ns-hit]', error)
                }
            }
        }
    }

    private resetHighlight(): void {
        if (this.selectedIndex > -1) {
            this.elements[this.selectedIndex]?.classList.remove('selected')
            this.selectedIndex = -1
        }
    }

    private dispose(): void {
        this.resetHighlight()
        this.elements = []
        this.unbindCallbacks.forEach((v) => v())
        this.unbindCallbacks = []
    }

    update(state: State): void {
        this.dispose()

        AnyPromise.resolve(this.render(this.container, state)).then(() => {
            // Without setTimeout React does not have committed DOM changes yet, so we don't have the correct elements.
            setTimeout(() => {
                this.loadElements()
                this.bindDataCallbacks()
                this.show()
            }, 0)
        })
    }

    hide(): void {
        this.resetHighlight()
        this.container.style.display = 'none'
    }

    show(): void {
        if (!this.isEmpty) {
            this.container.style.display = ''
        } else {
            this.hide()
        }
    }

    clear(): void {
        this.dispose()
        this.isEmpty = true
        this.hide()
    }

    isOpen(): boolean {
        return this.container.style.display !== 'none'
    }

    goDown(): void {
        let prevIndex = this.selectedIndex

        if (this.selectedIndex === this.elements.length - 1) {
            this.selectedIndex = 0
        } else {
            prevIndex = this.selectedIndex++
        }

        this.highlight(this.selectedIndex, prevIndex)
    }

    goUp(): void {
        if (this.selectedIndex > -1) {
            let prevIndex = this.selectedIndex

            if (this.selectedIndex === 0) {
                this.selectedIndex = this.elements.length - 1
            } else {
                prevIndex = this.selectedIndex--
            }

            this.highlight(this.selectedIndex, prevIndex)
        } else {
            this.selectedIndex = this.elements.length - 1
            this.highlight(this.selectedIndex)
        }
    }

    handleSubmit(): void {
        if (
            this.isOpen() &&
            this.selectedIndex > -1 &&
            this.elements[this.selectedIndex]
        ) {
            this.handleElementSubmit(this.elements[this.selectedIndex])
        }
    }

    hasHighlight(): boolean {
        return this.selectedIndex > -1
    }

    destroy(): void {
        this.dispose()
        this.isEmpty = true
        this.container.innerHTML = ''
    }
}
