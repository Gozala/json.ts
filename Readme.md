# json.ts

[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![docs][docs-image]][docs-url]


Types definition for arbirtary JSON

## Usage

### Import

```ts
import * as JSON from "json.ts"
```

Arbirtary `JSON` data is represented via `JSON.Value` type. Library also
provides strictly typed versio of `parse` and `stringify` functions along
with `match` for simpler pattern match over `JSON.Value`.

For detailed API overview and examples please take a look at
[API documentation][docs-url].

## Install

### yarn

    yarn add --save json.ts

### npm

    npm install --save json.ts

[travis-image]: https://travis-ci.org/Gozala/json.ts.svg?branch=master
[travis-url]: https://travis-ci.org/Gozala/json.ts
[npm-image]: https://img.shields.io/npm/v/json.ts.svg
[npm-url]: https://npmjs.org/package/json.ts
[downloads-image]: https://img.shields.io/npm/dm/json.ts.svg
[downloads-url]: https://npmjs.org/package/json.ts
[docs-image]:https://img.shields.io/badge/typedoc-latest-ff69b4.svg?style=flat
[docs-url]:https://gozala.github.io/json.ts/