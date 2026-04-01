interface Cell {
    targetRef: WeakRef<WeakKey>
    heldValue: any
    unregisterTokenRef?: WeakRef<WeakKey>
    unregisterTokenCellSet?: Set<Cell>
}

interface DereferenceRegistryData {
    symbol: symbol
    DereferenceRegistryRef: WeakRef<DereferenceRegistry>
    started: boolean
    intervalId: number | ReturnType<typeof setInterval>
    interval: number
    cellSet: Set<Cell>
    unregisterTokenToCellSetMap: WeakMap<WeakKey, Set<Cell>>
    cleanup: (heldValue: any) => void
}

const DereferenceRegistrySymbol = Symbol()
const targetToWeakRefMap: WeakMap<WeakKey, WeakRef<WeakKey>> = new WeakMap
const unregisterTokenToWeakRefMap: WeakMap<WeakKey, WeakRef<WeakKey>> = new WeakMap

const DereferenceRegistryCleanup = (data: DereferenceRegistryData) => {
    for (const cell of data.cellSet) {
        const { targetRef, heldValue } = cell

        if (targetRef.deref()) continue

        data.cellSet.delete(cell)
        cell.unregisterTokenCellSet?.delete(cell)
        data.cleanup(heldValue)
    }

    if (data.cellSet.size === 0 && !data.DereferenceRegistryRef.deref()) clearInterval(data.intervalId)
}

export class DereferenceRegistry {
    #data: DereferenceRegistryData

    constructor (cleanup: (heldValue: any) => void, interval = 60000) {
        if (typeof cleanup !== 'function') throw new TypeError(`cleanup (${typeof cleanup}) argument is not a function.`)

        interval = Math.trunc(Number(interval))
        if (interval < 10 || !interval) interval = 10
        if (interval > 2147483647) interval = 2147483647

        this.#data = {
            symbol: DereferenceRegistrySymbol,
            DereferenceRegistryRef: new WeakRef(this),
            started: false,
            intervalId: NaN,
            interval,
            cellSet: new Set,
            unregisterTokenToCellSetMap: new WeakMap,
            cleanup
        }
    }

    get interval () {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        return this.#data.interval
    }
    set interval (ms) {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        ms = Math.trunc(Number(ms))
        if (ms < 10 || !ms) ms = 10
        if (ms > 2147483647) ms = 2147483647

        clearInterval(this.#data.intervalId)
        this.#data.intervalId = setInterval(DereferenceRegistryCleanup, this.#data.interval = ms, this.#data)
    }

    get cleanup () {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        return this.#data.cleanup
    }
    set cleanup (fn: (heldValue: any) => void) {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        if (typeof fn !== 'function') throw new TypeError(`cleanup (${typeof fn}) is not a function.`)

        this.#data.cleanup = fn
    }

    get started () {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        return this.#data.started
    }

    register (target: WeakKey, heldValue?: any, unregisterToken?: WeakKey) {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        const typeofTarget = typeof target
        if (
            (typeofTarget !== 'function' && typeofTarget !== 'object' && typeofTarget !== 'symbol') ||
            target === null
        ) throw new TypeError(`target (${typeofTarget}) is not a function, object or symbol.`)

        let targetRef = targetToWeakRefMap.get(target)
        if (!targetRef) targetRef = new WeakRef(target)

        const cell: Cell = {
            targetRef,
            heldValue,
            unregisterTokenRef: undefined
        }

        this.#data.cellSet.add(cell)

        if (unregisterToken === undefined) return

        const typeofUnregisterToken = typeof unregisterToken
        if (typeofUnregisterToken !== 'function' && typeofUnregisterToken !== 'object' && typeofUnregisterToken !== 'symbol')
            throw new TypeError(`target (${typeofUnregisterToken}) is not a function, object or symbol.`)

        let unregisterTokenRef = unregisterTokenToWeakRefMap.get(unregisterToken)
        if (!unregisterTokenRef) unregisterTokenRef = new WeakRef(unregisterToken)

        let cellSet = this.#data.unregisterTokenToCellSetMap.get(unregisterToken)
        if (!cellSet) this.#data.unregisterTokenToCellSetMap.set(unregisterToken, cellSet = new Set)

        cell.unregisterTokenRef = unregisterTokenRef
        cellSet.add(cell)
    }

    unregister (unregisterToken: WeakKey) {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        const typeofUnregisterToken = typeof unregisterToken
        if (
            (typeofUnregisterToken !== 'function' && typeofUnregisterToken !== 'object' && typeofUnregisterToken !== 'symbol') ||
            unregisterToken === null
        ) throw new TypeError(`target (${typeofUnregisterToken}) is not a function, object or symbol.`)

        const cellSet = this.#data.unregisterTokenToCellSetMap.get(unregisterToken)

        if (!cellSet || cellSet.size === 0) return false

        for (const cell of cellSet) {
            this.#data.cellSet.delete(cell)
        }

        cellSet.clear()

        return true
    }

    runCleanup () {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        DereferenceRegistryCleanup(this.#data)
    }

    start () {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        if (this.#data.intervalId) return

        this.#data.started = true
        this.#data.intervalId = setInterval(DereferenceRegistryCleanup, this.#data.interval, this.#data)
    }

    stop () {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        if (!this.#data.intervalId) return

        clearInterval(this.#data.interval)
        this.#data.started = false
        this.#data.intervalId = NaN
    }

    clear () {
        if (this.#data?.symbol !== DereferenceRegistrySymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a DereferenceRegistry instance`)

        clearInterval(this.#data.intervalId)
        this.#data.intervalId = NaN
        this.#data.cleanup = undefined as any
        this.#data.cellSet.clear()
    }
}

export default DereferenceRegistry