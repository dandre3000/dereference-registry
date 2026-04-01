# dereference-registry

Like FinalizationRegistry but with more control and the cleanup function is guaranteed to be called for each dereferenced registered entry.

## Installation

npm i @dandre3000/dereference-registry

## Usage

## Exports

### Class DereferenceRegistry

#### constructor (cleanup: (heldValue: any) => void, interval?: number)

### Instance properties

#### interval: number

#### cleanup: (heldValue: any) => void

### Instance methods

#### register (target: WeakKey, heldValue?: any, unregisterToken?: WeakKey): void

#### unregister (unregisterToken: WeakKey): boolean

#### clear (): void

## License

[MIT](https://github.com/dandre3000/async-message/blob/main/LICENSE)
