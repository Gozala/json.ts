import * as JSON from ".."
import test from "tape"

test("test baisc", test => {
  test.isEqual(typeof(JSON), "object")
  test.end()
})
