import {readFileSync, writeFileSync} from 'fs';
import transformFile from '../transformFile';

test('pipeline', async () => {
  const filename = __dirname + '/../example.src.ts';
  const outputFilename = __dirname + '/../example.ts';
  const output = await transformFile(filename);
  expect(output).toMatchSnapshot();
  if (readFileSync(outputFilename, 'utf8') !== output) {
    writeFileSync(outputFilename, output);
  }
});
