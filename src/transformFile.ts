import {readFile} from 'fs';
import transformString from './transformString';
const prettier = require('prettier');

export default async function transformFile(
  filename: string,
): Promise<string | null> {
  let [output, prettierOptions] = await Promise.all([
    new Promise<string | null>((resolve, reject) => {
      readFile(filename, 'utf8', (err, data) => {
        if (err) reject(err);
        else
          resolve(
            /\@opaque/.test(data) || /\@nominal/.test(data) ? data : null,
          );
      });
    }).then(src => src && transformString(src)),
    prettier.resolveConfig(filename),
  ]);
  if (!output) {
    return output;
  }
  let previousOutput = null;
  let iterations = 0;
  prettierOptions = {
    ...prettierOptions,
    parser: 'typescript',
    filepath: filename,
  };
  while (previousOutput !== output && iterations < 10) {
    iterations++;
    [previousOutput, output] = [
      output,
      prettier.format(output, prettierOptions),
    ];
  }
  return output;
}
