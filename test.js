// import { DereferenceRegistry } from '@dandre3000/dereference-registry'
import { DereferenceRegistry } from './index.ts'

const registryRefSet = new Set
let gcTarget = false
setInterval(() => {
    const registry = new DereferenceRegistry(value => gcTarget = true, 1000)
    registryRefSet.add(new WeakRef(registry))
    const unregisterToken = Symbol()
    for (let i = 0; i < 100; i++) {
        registry.register(unregisterToken, Math.random(), unregisterToken)
    }
    registry.unregister(unregisterToken)
    if (gcTarget) console.log('cleanup')
}, 10)

let gcRegistry = false
setInterval(() => {
    for (const registryRef of registryRefSet) {
        if (!registryRef.deref()) gcRegistry = true
    }
    if (gcRegistry) console.log('gc registry')
}, 100)