import { DefaultState } from "./state"

type Items = NonNullable<DefaultState["history"]>

export class History {
    private localStorageKey = "nostoAutocomplete:history"
    private items = [] as unknown as Items

    constructor(protected size: number) {
        this.items = this.get()
    }

    private get(): Items {
        try {
            return (
                JSON.parse(
                    localStorage.getItem(this.localStorageKey) ?? "[]"
                ) ?? []
            )
        } catch (err) {
            console.error("Could not get history items.", err)
            return [] as unknown as Items
        }
    }

    private set(data: Items): void {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(data))
        } catch (err) {
            console.error("Could not set history items.", err)
        }
    }

    add(item: string): void {
        this.items = [
            { item },
            ...(this.items?.filter(v => v.item !== item) || []),
        ].slice(0, this.size)
        this.set(this.items)
    }

    clear(): void {
        this.items = []
        this.set(this.items)
    }

    remove(item: string): void {
        this.items = this.items.filter(v => v.item !== item)
        this.set(this.items)
    }

    getItems(): Items {
        return this.items
    }
}
