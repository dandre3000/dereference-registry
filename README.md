# dereference-registry

Like FinalizationRegistry but the cleanup function is guranteed to be called for each dereferenced target.

## Installation

npm i @dandre3000/dereference-registry

## Usage

## Exports

### Class DereferenceRegistry

#### constructor (cleanup: Cleanup, interval?: number)

#### Instance methods

#### register (target: WeakKey, heldValue?: any, unregisterToken?: WeakKey): void

#### unregister (unregisterToken: WeakKey): boolean

## License

[MIT](https://github.com/dandre3000/async-message/blob/main/LICENSE)
