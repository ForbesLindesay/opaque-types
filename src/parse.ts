import {File} from '@babel/types';
const {parse} = require('@babel/parser');

export interface Options {
  filename?: string;
}
export default function parseSource(src: string, options: Options = {}): File {
  const result: File = parse(src, {
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    sourceType: 'module',
    sourceFilename: options.filename,
    plugins: [
      'jsx',
      'typescript',
      'doExpressions',
      'objectRestSpread',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'asyncGenerators',
      'functionBind',
      'dynamicImport',
      'numericSeparator',
      'optionalChaining',
      'bigInt',
      'optionalCatchBinding',
      'throwExpressions',
      'pipelineOperator',
      'nullishCoalescingOperator',
    ],
  });
  (result.program as any).source = src;
  return result;
}
