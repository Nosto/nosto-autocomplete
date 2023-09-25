import { AnyPromise } from './utils/promise'

export class Dropdown<State> {
    protected state: State = {} as State
    protected isEmpty: boolean = true
    protected selectedIndex: number = -1
    private elements: HTMLElement[] = []

    constructor(
        public container: HTMLElement,
        protected render: (
            container: HTMLElement,
            state: State,
        ) => void | PromiseLike<void>,
        protected updateInput: (value: string) => void,
    ) {
        this.hide()
    }

    private highlight(
        index: number,
        prevIndex?: number,
    ): void {
        if (typeof prevIndex === 'number' && this.elements[prevIndex]) {
            this.elements[prevIndex].classList.remove('selected')
        }

        if (typeof index === 'number' && this.elements[index]) {
            this.elements[index]?.classList.add('selected')

            const hit = this.elements[index]?.dataset?.nsHit

            if (hit) {
                try {
                    const parsedHit = JSON.parse(hit)
                    if (parsedHit.keyword) {
                        this.updateInput(parsedHit.keyword)
                    }
                } catch (error) {
                    console.error('Could not parse [data-ns-hit]')
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

    update(state: State): void {
        AnyPromise.resolve(this.render(this.container, state)).then(() => {
            this.isEmpty = !this.container.innerHTML.trim()
            this.resetHighlight()
            if (!this.isEmpty) {
                this.elements = Array.from(this.container.querySelectorAll('[data-ns-hit]'))
            }
            this.show()
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
        this.isEmpty = true
        this.resetHighlight()
        this.elements = []
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

    submit(): void {
        if (
            this.isOpen() &&
            this.selectedIndex > -1 &&
            this.elements[this.selectedIndex]
        ) {
            const hit = this.elements[this.selectedIndex]?.dataset?.nsHit

            if (hit) {
                try {
                    const parsedHit = JSON.parse(hit)
                    if (parsedHit.url) {
                        location.href = parsedHit.url
                    }
                } catch (error) {
                    console.error('Could not parse [data-ns-hit]')
                }
            }

        }
    }

    destroy(): void {
        this.container.innerHTML = ''
    }
}
