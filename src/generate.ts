import {File} from '@babel/types';
const generate = require('@babel/generator').default;

export default function generateSource(file: File): string {
  return generate(file).code;
}
