import { State } from './state'

export class Dropdown {
    protected state: State = {}
    protected isEmpty: boolean = true

    constructor(
        protected container: HTMLElement,
        protected render: (container: HTMLElement, state: State) => void | PromiseLike<void>,
    ) {
        this.hide()
    }

    update(state: State): void {
        Promise.resolve(this.render(this.container, state)).then(() => {
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

    destroy(): void {
        this.container.innerHTML = ''
    }
}
