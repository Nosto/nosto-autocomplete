import { State } from './state'

export class Dropdown {
    protected state: State = {}
    protected isEmpty: boolean = true

    constructor(
        protected container: HTMLElement,
        protected render: ((state: State) => string) | ((state: State) => PromiseLike<string>),
    ) {
        this.hide()
    }

    update(state: State): void {
        Promise.resolve(this.render(state)).then((result) => {

            this.isEmpty = !result.trim()
            this.container.innerHTML = result
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
