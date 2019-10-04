import * as fs from 'fs';
import {parse, SliceSource} from 'slice2json';

/** @internal */
export interface LoadedSlice {
  filePath: string;
  contents: string;
  parsed: SliceSource;
}

/** @internal */
export async function loadSlices(paths: string[]): Promise<LoadedSlice[]> {
  return Promise.all(
    paths.map(async filePath => {
      const contents = await new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });

      const parsed = parse(contents);

      return {
        filePath,
        contents,
        parsed,
      };
    }),
  );
}
