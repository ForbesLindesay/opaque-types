import {readFile} from 'fs';
import parse from './parse';
import transform from './transformAST';
import generate from './generate';

export default function transformString(
  src: string,
  options?: {filename?: string},
) {
  return (
    '/**\n * @generated opaque-types\n */\n\n' +
    generate(transform(parse(src, options)))
  );
}
