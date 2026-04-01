import { expect } from 'expect'
import { runTests } from './runTests.js'
import { test } from 'bun:test'

runTests(test, expect)