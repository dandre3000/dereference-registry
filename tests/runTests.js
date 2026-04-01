import DereferenceRegistry from '@dandre3000/dereference-registry'

export const runTests = async (test, expect) => {
    test('new DereferenceRegistry cleanup must be a function', () => {
        expect(() => new DereferenceRegistry({})).toThrowError(TypeError)
    })

    test('new DereferenceRegistry interval must be a number', () => {
        expect(() => new DereferenceRegistry(() => {}, '1000')).toThrowError(TypeError)
    })

    test('DereferenceRegistry instance methods this must be a DereferenceRegistry instance', () => {
        expect(() => DereferenceRegistry.prototype.register.call({}, {})).toThrowError(TypeError)
        expect(() => DereferenceRegistry.prototype.unregister.call({}, {})).toThrowError(TypeError)
        expect(() => DereferenceRegistry.prototype.disconnect.call()).toThrowError(TypeError)
    })

    test('DereferenceRegistry.prototype.register target is required and must be a function, object or symbol', () => {
        expect(() => new DereferenceRegistry(() => {}).register()).toThrowError(TypeError)
        expect(() => new DereferenceRegistry(() => {}).register(null)).toThrowError(TypeError)
    })

    test('DereferenceRegistry.prototype.register unregisterToken must be a function, object or symbol', () => {
        expect(() => new DereferenceRegistry(() => {}).register(null)).toThrowError(TypeError)
    })

    test('DereferenceRegistry.prototype.unregister unregisterToken is required and must be a function, object or symbol', () => {
        expect(() => new DereferenceRegistry(() => {}).unregister()).toThrowError(TypeError)
        expect(() => new DereferenceRegistry(() => {}).unregister(null)).toThrowError(TypeError)
    })

    test('DereferenceRegistry.prototype.unregister returns true if at least one entry has been removed', () => {
        const unregisterToken = Symbol()
        const registry = new DereferenceRegistry(() => {})

        expect(registry.unregister(unregisterToken)).toBeFalsy()

        registry.register({}, undefined, unregisterToken)
        expect(registry.unregister(unregisterToken)).toBeTruthy()

        registry.disconnect()
    })

    test('cleanup will be called for all registered entries if the corresponding target has been dereferenced', async () => {
        const heldValue = Math.random()

        expect(await new Promise((resolve, reject) => {
            let gcValue = Symbol()
            const registry = new DereferenceRegistry(value => gcValue = value, 1000)

            const targetIntervalId = setInterval(() => {
                for (let i = 0; i < 100; i++) {
                    registry.register({}, heldValue)
                }

                if (typeof gcValue === 'symbol') return

                registry.disconnect()
                clearInterval(targetIntervalId)

                if (gcValue === heldValue)
                    resolve(gcValue)
                else
                    reject()
            }, 10)
        })).toBe(heldValue)
    })
}