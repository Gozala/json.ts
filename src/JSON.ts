/**
 * Module provides a typed alternative for global
 * [JSON][JSON MDN] object by exporting typed versions of `JSON.parse` and
 * JSON.stringify` functions for parsing [JavaScript Object Notation][JSON]
 * (JSON) and converting values to JSON. In addition it exports types for JSON
 * values.
 * 
 * [JSON MDN]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
 * [JSON]:http://json.org/
 */
import * as array from "./Array"
import {Result, ok, error} from "result.ts"

const {parse:parseJSON, stringify:stringifyJSON} = JSON

/**
 * Type represents JSON objects.
 */
export interface Object {
  [key: string]: Value
}

/**
 * Type represents JSON arrays.
 */
export interface Array extends array.Of<Value> {}

export type Null = null
export type Boolean = boolean
export type Number = number
export type String = string

/**
 * Type representing arbitrary JSON object.
 */
export type Value =
  | Null
  | Boolean
  | String
  | Number
  | Array
  | Object

/**
 * Type predicate to refines given `value` type to `null`
 * 
 * ```ts
 * var data = JSON.parse('null')
 * // Line below won't type check
 * var x:null = data // => [ts]: Type 'Value' is not assignable to type 'null'
 * 
 * // Line below works due to type refinement with type predicate
 * if (JSON.isNull(data)) {
 *    var x:null = data
 * }
 * ```
 */
export const isNull = (value:any):value is null =>
  value === null

/**
 * Type predicate to refine given `value` type to `boolean`
 * 
 * ```ts
 * var data = JSON.parse('true')
 * // Line below won't type check
 * var x:boolean = data // => [ts]: Type 'Value' is not assignable to type 'boolean'
 * 
 * // Line below works due to type refinement with type predicate
 * if (JSON.isBoolean(data)) {
 *    var x:boolean = data
 * }
 * ```
 */
export const isBoolean = (value:any):value is boolean =>
  typeof value === 'boolean'

/**
 * Type predicate to refine given `value` type to `number`
 * 
 * ```ts
 * var data = JSON.parse('5.4')
 * // Line below won't type check
 * data.toFixed() // => [ts]: Property 'toFixed' does not exist on type 'Value'
 * 
 * // Line below works due to type refinement with type predicate
 * if (JSON.isNumber(data)) {
 *    data.toFixed() // => <string>'5'
 * }
 * ```
 */
export const isNumber = (value:any):value is number =>
  typeof value === 'number'

/**
 * Type predicate to refine given `value` type to `string`
 * 
 * ```ts
 * var data = JSON.parse('"Hi"')
 * // Line below won't type check
 * data.toUpperCase() // => [ts]: Property 'toUpperCase' does not exist on type 'Value'
 * 
 * // Line below works due to type refinement with type predicate
 * if (JSON.isString(data)) {
 *    data.toUpperCase() // => <string>'HI'
 * }
 * ```
 */
export const isString = (value:any):value is string =>
  typeof value === 'string'

/**
 * Type predicate to refine given `value` type to `JSON.Array`
 * 
 * ```ts
 * var data = JSON.parse('[1, 2, 3]')
 * // Line below won't type check
 * data.map(String) // => [ts]: Property 'map' does not exist on type 'Value'
 * 
 * // Line below works due to type refinement with type predicate
 * if (JSON.isArray(data)) {
 *    data.map(String) // => <Array<string>>['1','2','3']
 * }
 * ```
 */
export const isArray = (value:Value):value is Array =>
  array.is(value)

/**
 * Type predicate to refine given `value` type to `JSON.Object`
 *
 * ```ts
 * var data = JSON.parse('{a:{b:{c:3}}}')
 * // Line below won't type check
 * data.a // => [ts]: Property 'a' does not exist on type 'Value'
 * 
 * // Line below works due to type refinement with type predicate
 * if (JSON.isObject(data)) {
 *    data.a // => <JSON.Value>{b:{c:3}}
 * }
 * ```
 */
export const isObject = (value:Value):value is Object =>
  value != null && value.constructor.name === 'Object'

/**
 * Type represents parse result.
 */
export type ParseResult = Result<SyntaxError, Value>

/**
 * Parse a `input` string as `JSON`, optionally transform the produced value
 * and its properties, and return the value.
 * 
 * #### Difference from built-in `JSON.parse`
 * 
 * Unlike built-in this returns `Result<SyntaxError, Value>` where `SyntaxError`
 * is error that built-in throws on invalid JSON input and `Value` is typed
 * JSON instead of `any`.
 * 
 * If optional `reviever` is used and it omits everything built-in version
 * returns `undefined` which is not valid JSON. This implementation returns
 * `Result<SyntaxError, null>` instead.
 * 
 * @param input The string to parse as JSON.
 * @param reviver If argument is passed, this prescribes how the `value`
 * originally produced by parsing is transformed, before being returned.
 * @return Result that is either `ok` containing JSON value corresponding to
 * the given JSON text or `error` containing `SyntaxError` describing why
 * input is not a valid JSON.
 */
export const parse = (input:string, reviver?:Reviver):ParseResult => {
  try {
    const json = parseJSON(input, reviver)
    if (json == null) {
      return ok(null)
    } else {
      return ok(json)
    }
  } catch (exception) {
    return error(exception)
  }
}

export type Reviver =
  /**
   * @param key name of the member being transformed
   * @param value value of the member being transformed
   * @return transformed `value` or `void` to be omitted.
   */
  (key:string, value:Value) => void|Value

/**
 * Type extends built-in `Error` with optinal `coughtError` field. The reason is
 * in JS you can throw and catch anything including numbers etc... But to have
 * somewhat typed API we're normalizing non `Error` exceptions by creating a
 * new `Error` and storing actually caught one under `coughtError` field.
 */
export type CaughtError = Error & {coughtError?:any}

/**
 * Type represents serialization result returned by calling `stringify`.
 */
export type SerializationResult = Result<CaughtError, string>

export function stringify(value:Value):SerializationResult
export function stringify(value:Value, whiteList:WhiteList):SerializationResult
export function stringify(value:Value, replacer:Replacer):SerializationResult
export function stringify(value:Value,
                          replacerOrWhiteList:null|void|WhiteList|Replacer,
                          space:string):SerializationResult
export function stringify(value:Value,
                          replacerOrWhiteList:void|null|WhiteList|Replacer,
                          spaceSize:number):SerializationResult
/**
 * Function serializes a JSON.Value to a string.
 * 
 * #### Difference from built-in `JSON.stringify`
 * 
 * Unlike built-in version this function returns `SerializationResult` which is
 * either `ok` containing serialized string or an `error` containing an `Error`
 * that built-in version would have thrown.
 * 
 * Unlike built-in version if this function succeeds (returns ok) it's result
 * value is guaranteed to parse. There is a catch though built-in returns
 * `undefined` if `replacer` omits everything. In such case this function
 * returns string `"null"` which would parse to `null` which seems to better
 * capture the fact that `JSON.Value` got serailzed to nothing.
 * 
 * @param value JSON value to be serialized.
 * @param whiteList An array of strings and numbers that serve as a whitelist
 * for selecting/filtering the properties of the value object to be included
 * in the JSON string.
 * @param replacer Replacing values of members by results of calling given
 * `replacer` function with member name and value.
 * @param replacerOrWhiteList A function that alters the behavior of the
 * stringification process, or an array of string and number objects that
 * serve as a whitelist for selecting/filtering the properties of the value
 * object to be included in the JSON string. If this value is null or not
 * provided, all properties of the object are included in the resulting JSON
 * string.
 * @param space A `string` used to insert white space into the output JSON
 * string for readability purposes. Geven string (or the first 10 characters
 * of the string, if it's longer than that) is used as white space.
 * @param spaceSize A `number` that's used to insert white space into the output
 * JSON string for readability purposes. Number indicates the number of space
 * characters to use as white space; this number is capped at 10 (if it is
 * greater, the value is just 10). Values less than 1 indicate that no space
 * should be used.
 * @param spaceOrSize A string or number that's used to insert white space into the
 * output JSON string for readability purposes. If this is a number, it
 * indicates the number of space characters to use as white space; this number
 * is capped at 10 (if it is greater, the value is just 10). Values less than 1
 * indicate that no space should be used. If this is a string, the string
 * (or the first 10 characters of the string, if it's longer than that) is used
 * as white space. If this parameter is not provided (or is null), no white
 * space is used.
 */
export function stringify(value:Value,
                          replacerOrWhiteList?:any,
                          spaceOrSize?:string|number):SerializationResult {
  try {
    const json = stringifyJSON(value, replacerOrWhiteList, spaceOrSize)
    const result = json == null
      ? ok('null')
      : ok(json)
    return result
  } catch (exception) {
    let reason:CaughtError
    if (exception instanceof Error) {
      reason = <CaughtError>exception
    } else {
      reason = <CaughtError>
        new Error(`JSON.stringify has thrown non Error exception: ${exception}`)
      reason.coughtError = exception
    }
    return error(reason)
  }
}

/**
 * An array of strings and numbers that serve as a whitelist for
 * selecting/filtering the properties of the value object to be included
 * in the JSON string.
 */
export type WhiteList = (string|number)[]
export type Replacer =
  /**
   * @param key key of the member to be replaced
   * @param value value of the member to be replaced.
   * @return If `void` is returned member will be ommited otherwise
   * it will be substituted with a returned member.
   */
  (key:string, value:Value)=>void|Value


/**
 * Function provides a means to pattern match over the `JSON.Value` with very
 * little overhead. It takes a **"mapper"** function for each `JSON.Value`
 * type and returns a **"composite mapper"** function that takes `JSON.Value`,
 * refines it to a concrete type and then maps it with corresponding "mapper".
 * 
 * ```ts
 * const show = match
 * ( _ => 'null'
 *   boolean => boolean.toString(),
 *   number => number.toFixed(),
 *   string => string.toUpperCase(),
 *   array => array.forEach(String),
 *   object => JSON.stringify(object))
 * 
 * show(JSON.parse('null')) // => null
 * show(JSON.parse('true')) // => true
 * show(JSON.parse('"Hi"')) // => "HI"
 * show(JSON.parse('{name: "Jack"}')) // => {name: "Jack"}
 * ```
 * 
 * Please note that this implies that all "mapper" functions return value of
 * the same type. In practice this means that often return type of the
 * "composite mapper" function will be a [type union][] or rather a
 * [discriminated union][] that you'd have to either match over or refine
 * further. If that is too cumbersome for your use case consider using
 * `isArray`, `isObject` and other type predicates provided instead.
 * 
 * #### Known limitation
 * 
 * As of writing Typescript (2.3.3) has trouble infering return type of the
 * "composite mapper" function created by `match` if it is recursive - If any
 * of the "mapper" functions refer to "composite mapper" directly or indirectly.
 * In order to overcome this limitation you'd have to type manually anotate
 * either "mapper" functions passed to `match` or anotate resulting "composite
 * mapper" instead & that's where exported `Match` type alias comes handy:
 * 
 * ```ts
 * const toTypedString = match
 * ( _ => '<null>null',
 * 
 * ```
 * 
 * [type union]:https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types
 * [discriminated union]:https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */

export const match = <a>
  ( /**
     * Function is invoked with a `null` if `Value` matched over is `null`.
     */
    Null:(value:Null) => a,
    /**
     * Function is invoked with a boolean value if `Value` matched is a boolean.
     */
    Boolean:(boolean:Boolean) => a,
    /**
     * Function is invoked with a number value if `Value` matched is a number. 
     */
    Number:(number:Number) => a,
    /**
     * Function is invoked with a string value if `Value` matched is a number. 
     */
    String:(string:String) => a,
    /**
     * Function is invoked with a `JSON.Array` if `Value` matched is a
     * `JSON.Array`.
     */
    Array:(array:Array) => a,
    /**
     * Function is invoked with a `JSON.Object` if `Value` matched is a
     * `JSON.Object`.
     */
    Object:(object:Object) => a
  ):Match<a> =>
  (value:Value):a => {
    switch (typeof value) {
      case 'number':
        return Number(<Number>value)
      case 'boolean':
        return Boolean(<Boolean>value)
      case 'string':
        return String(<String>value)
      case 'object':
      default:
        if (value == null) {
          return Null(<Null>value)
        } else if (isArray(value)) {
          return Array(<Array>value)
        } else {
          return Object(<Object>value)
        }
    }
  }

/**
 * Type represents "composite mapper" that is returned by `match` function. It
 * takes `Value`, refines it to concrete type and maps with a corresponding
 * "mapper" function.
 */
export type Match <a> =
  (value:Value) => a