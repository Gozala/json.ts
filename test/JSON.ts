import * as JSON from ".."
import * as test from "tape"
import {error} from "result.ts"


test("test exports", test => {
  test.equal(typeof JSON, "object", "JSON is object")
  test.equal(typeof JSON.stringify, "function", "JSON.stringify is function")
  test.equal(typeof JSON.parse, "function", "JSON.parse is function")
  test.equal(typeof JSON.match, "function", "JSON.match is function")
  test.end()
})


test("test parse", test => {
  test.equal(JSON.parse("null").toValue(-1), null)
  test.deepEqual(JSON.parse("true").toMaybe(), true)
  test.deepEqual(JSON.parse("false").toMaybe(), false)
  test.equal(JSON.parse("1").toMaybe(), 1)
  test.equal(JSON.parse("1.09").toMaybe(), 1.09)
  test.equal(JSON.parse('"1.09"').toMaybe(), "1.09")
  test.deepEqual(JSON.parse('{}').toMaybe(), {})
  test.deepEqual(JSON.parse('{"a":1}').toMaybe(), {a:1})
  test.deepEqual(JSON.parse('[1, 2, 3]').toMaybe(), [1, 2, 3])

  test.equal(JSON.parse("").isOk, false)

  test.end()
})

test("test parse with reviver", test => {
  test.deepEqual(JSON.parse("true", (_key, _value) => void 0).toValue(-1), null)
  test.deepEqual(JSON.parse("false", (_, v) => v).toMaybe(), false)
  test.deepEqual(JSON.parse("false", (_, v) => ({v})).toMaybe(), {v:false})
  test.deepEqual(JSON.parse('{"a":1, "b":2}', (k, v) => k == "" ?  v : null).toMaybe(), {a:null, b:null})

  test.end()
})

test("test stringify", test => {
  test.deepEqual(JSON.stringify(null).toMaybe(), 'null')
  test.deepEqual(JSON.stringify(1).toMaybe(), '1')

  test.deepEqual(JSON.stringify({}, (_k, _v) => void 0).toMaybe(), 'null')
  test.deepEqual(JSON.stringify({}, (_k, _v) => 0).toMaybe(), '0')

  test.deepEqual(JSON.stringify({ get a():string { throw Error('boom') } }),
                 error(Error('boom')))

  test.deepEqual(JSON.stringify({ get a():string { throw 2 } }),
                 error(Object.assign(Error('JSON.stringify has thrown non Error exception: 2'), {coughtError:2})))

  test.end()
})

test("test match", test => {
  const show:JSON.Match<string> = JSON.match
    ( _ => `<null>${_}`,
      boolean => `<boolean>${boolean}`,
      number =>
        Number.isInteger(number) ? `<int>${number}` : `<float>${number}`,
      string => `<string>"${string.toUpperCase()}"`,
      array =>
        `<JSON.Array>[${array.map(show).join(', ')}]`,
      object => {
        const members =
          Object.keys(object)
                .map(key => `"${key}":${show(object[key])}`)

        return `<JSON.Object>{${members.join(', ')}}`
      }
    )

    test.equal(show(JSON.parse('null').toMaybe()), '<null>null')
    test.equal(show(JSON.parse('true').toMaybe()), '<boolean>true')
    test.equal(show(JSON.parse('false').toMaybe()), '<boolean>false')
    test.equal(show(JSON.parse('3').toMaybe()), '<int>3')
    test.equal(show(JSON.parse('7.2').toMaybe()), '<float>7.2')
    test.equal(show(JSON.parse('"Hi"').toMaybe()), '<string>"HI"')
    test.equal(
      show(JSON.parse('[null, 3, 4.1, "Hi", [], {"a":1}]').toMaybe()),
      '<JSON.Array>[<null>null, <int>3, <float>4.1, <string>"HI", <JSON.Array>[], <JSON.Object>{"a":<int>1}]')

    test.equal(
      show(JSON.parse('{"name":"json", "tags":["foo", "bar"], "version":1.3}').toMaybe()),
      '<JSON.Object>{"name":<string>"JSON", "tags":<JSON.Array>[<string>"FOO", <string>"BAR"], "version":<float>1.3}')

    test.end()
})