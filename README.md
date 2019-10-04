# slice2md [![npm version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

Compiles Slice files to Markdown.

## Installation

    $ yarn add slice2md

## Usage

    Usage: slice2md [options] <file ...>

    Options:

      -V, --version         output the version number
      -e, --exclude <file>  File paths or globs to exclude.
      -o, --out-dir <dir>   Directory where to put generated files.
      -h, --help            output usage information

## API

```ts
import {slice2md} from 'slice2md';

slice2md(options); // Promise<void>;
```

Options interface:

```ts
{
  /**
   * Array of slice file paths or globs.
   */
  files: string[];
  /**
   * Array of file paths or globs to exclude.
   */
  exclude?: string[];
  /**
   * Directory where to put generated files.
   */
  outDir: string;
}
```

[npm-image]: https://badge.fury.io/js/slice2md.svg
[npm-url]: https://badge.fury.io/js/slice2md
[travis-image]: https://travis-ci.org/aikoven/slice2md.svg?branch=master
[travis-url]: https://travis-ci.org/aikoven/slice2md
