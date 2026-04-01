import { expect } from 'expect'
import { runTests } from './runTests.js'

await runTests(Deno.test, expect)