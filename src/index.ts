import {writeFile} from 'fs';
import lsr from 'lsr';
import transformAST from './transformAST';
import transformFile from './transformFile';
import transformString from './transformString';

export {transformAST, transformFile, transformString};
export default async function transformDirectory(
  dirname: string,
): Promise<void> {
  await Promise.all(
    (await lsr(dirname))
      .filter(entry => entry.isFile() && /\.src\.tsx?$/.test(entry.name))
      .map(entry =>
        transformFile(entry.fullPath).then(output => {
          return new Promise((resolve, reject) => {
            writeFile(
              entry.fullPath.replace(/\.src\.(tsx?)$/, '.$1'),
              output,
              err => {
                if (err) reject(err);
                else resolve();
              },
            );
          });
        }),
      ),
  );
}
