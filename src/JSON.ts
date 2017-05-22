
export interface Dictionary {
  [key: string]: Value
}

export interface Elements extends Array<Value> { }

export type Value =
  | null
  | boolean
  | string
  | number
  | Dictionary
  | Elements

export const parse = (input:string, reviver?:(key:string, value:Value) => Value):Value =>
  JSON.parse(input, reviver)

export const stringify = (value:Value,
                          replacer?:(key:string, value:Value)=>void|undefined|Value,
                          space?:string|number):string|undefined =>
  JSON.stringify(value, replacer, space)