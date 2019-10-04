import globCb = require('glob');
import {promisify} from 'util';

const glob = promisify(globCb);

/** @internal */
export async function resolveGlobs(
  globs: string[],
  ignore?: string[],
): Promise<string[]> {
  const results = await Promise.all(
    globs.map(pattern => glob(pattern, {ignore})),
  );

  const paths = new Set<string>();

  for (const result of results) {
    for (const path of result) {
      paths.add(path);
    }
  }

  return [...paths];
}
