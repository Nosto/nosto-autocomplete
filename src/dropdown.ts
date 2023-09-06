import { AnyPromise } from './utils/promise'

export class Dropdown<State> {
    protected state: State = {} as State
    protected isEmpty: boolean = true

    constructor(
        public container: HTMLElement,
        protected render: (
            container: HTMLElement,
            state: State,
        ) => void | PromiseLike<void>,
    ) {
        this.hide()
    }

    update(state: State): void {
        AnyPromise.resolve(this.render(this.container, state)).then(() => {
            this.isEmpty = !this.container.innerHTML.trim()
            this.show()
        })
    }

    hide(): void {
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
        this.hide()
    }

    isOpen(): boolean {
        return this.container.style.display !== 'none'
    }

    destroy(): void {
        this.container.innerHTML = ''
    }
}
