import {
  File,
  Statement,
  isVariableDeclaration,
  isTSTypeAliasDeclaration,
  isExportNamedDeclaration,
  isIdentifier,
  ObjectExpression,
  TSTypeAliasDeclaration,
  isObjectExpression,
  TSType,
  ObjectMethod,
  ObjectProperty,
  SpreadElement,
  variableDeclaration,
  variableDeclarator,
  identifier,
  tsTypeAnnotation,
  tsTypeOperator,
  tsSymbolKeyword,
  classDeclaration,
  classBody,
  TSTypeParameterDeclaration,
  classProperty,
  tsTypeQuery,
  tsTypeReference,
  tsTypeAliasDeclaration,
  tsIntersectionType,
  tsTypeParameterInstantiation,
  Comment,
  exportNamedDeclaration,
  exportSpecifier,
  Identifier,
  isObjectMethod,
  isObjectProperty,
  objectExpression,
  objectMethod,
  blockStatement,
  returnStatement,
  TSTypeAnnotation,
  tsAsExpression,
  tsAnyKeyword,
  ifStatement,
  callExpression,
  memberExpression,
  unaryExpression,
  throwStatement,
  newExpression,
  stringLiteral,
  binaryExpression,
  spreadElement,
  tsLiteralType,
  isStatement,
} from '@babel/types';

const addComment = require('@babel/types').addComment;

function uniqueSymbol(name: string) {
  const id = identifier(name);
  const op = tsTypeOperator(tsSymbolKeyword());
  op.operator = 'unique';
  id.typeAnnotation = tsTypeAnnotation(op);
  const declaration = variableDeclaration('const', [variableDeclarator(id)]);
  declaration.declare = true;
  return declaration;
}
function declareClass(
  name: string,
  symbolReference: TSType,
  typeParamaters: TSTypeParameterDeclaration | null,
) {
  const properties = [
    classProperty(
      identifier('__kind'),
      null,
      tsTypeAnnotation(symbolReference),
    ),
  ];
  if (typeParamaters) {
    typeParamaters.params.forEach((p, i) => {
      if (p.name) {
        properties.push(
          classProperty(
            identifier(`__${p.name}`),
            null,
            tsTypeAnnotation(tsTypeReference(identifier(p.name))),
          ),
        );
      }
    });
  }
  properties.forEach(prop => {
    prop.accessibility = 'private';
  });
  const cls = classDeclaration(identifier(name), null, classBody(properties));
  cls.declare = true;
  cls.typeParameters = typeParamaters;
  return cls;
}
function typeIdentifier(name: string, type: TSType) {
  const id = identifier(name);
  id.typeAnnotation = tsTypeAnnotation(type);
  return id;
}

class Placeholder {
  private _statements: Statement[];
  constructor(original: Statement) {
    this._statements = [original];
  }
  remove() {
    this._statements = [];
  }
  replace(statements: Statement[]) {
    this._statements = statements;
  }
  resolve(): Statement[] {
    return this._statements;
  }
}
class Type {
  private readonly _name: string;
  private readonly _placeholders: Placeholder[] = [];
  private _comments: Comment[] = [];
  private _baseType: TSTypeAliasDeclaration | undefined;
  private _methods: Array<ObjectMethod | ObjectProperty | SpreadElement> = [];
  private _export = false;
  constructor(name: string) {
    this._name = name;
  }
  private _placeholder(root: Statement) {
    if (isExportNamedDeclaration(root)) {
      this._export = true;
    }
    if (root.leadingComments) {
      this._comments.push(...root.leadingComments);
    }
    const placeholder = new Placeholder(root);
    this._placeholders.push(placeholder);
    return placeholder;
  }
  addMethods(expression: ObjectExpression | Identifier, root: Statement) {
    if (isObjectExpression(expression)) {
      this._methods.push(...expression.properties);
    } else {
      this._methods.push(spreadElement(expression));
    }
    return this._placeholder(root);
  }
  addBaseType(type: TSTypeAliasDeclaration, root: Statement) {
    this._baseType = type;
    return this._placeholder(root);
  }
  private _hasMethod(name: string) {
    return this._methods.some(
      method =>
        (isObjectMethod(method) || isObjectProperty(method)) &&
        isIdentifier(method.key) &&
        !method.computed &&
        method.key.name === name,
    );
  }
  private _addDefaultMethod(
    method: ObjectMethod,
    returnType: TSTypeAnnotation,
    typeParameters: TSTypeParameterDeclaration | null,
  ) {
    const key: Identifier = method.key;
    if (this._hasMethod(key.name)) {
      return;
    }
    method.returnType = returnType;
    if (typeParameters) {
      method.typeParameters = typeParameters;
    }
    this._methods.unshift(method);
  }
  private _hasComment(tag: string) {
    return this._comments.some(c => c.value.indexOf(tag) !== -1);
  }
  resolve() {
    const opaque = this._hasComment('@opaque');
    const nominal = this._hasComment('@nominal');

    if (this._baseType && (opaque || nominal)) {
      const placeholder = this._placeholders.pop()!;
      this._placeholders.forEach(p => p.remove());

      const expose = this._hasComment('@expose');
      const {typeParameters, typeAnnotation, id} = this._baseType;

      const typeParameterInstantiation = typeParameters
        ? tsTypeParameterInstantiation(
            typeParameters.params.map(p =>
              tsTypeReference(identifier(p.name!)),
            ),
          )
        : null;

      const BASE_NAME = this._name + '__Base';
      const SYMBOL_NAME = this._name + '__Symbol';
      const CLASS_NAME = this._name + '__Class';

      const result: Statement[] = [];
      result.push(
        exportNamedDeclaration(
          tsTypeAliasDeclaration(
            identifier(BASE_NAME),
            typeParameters,
            typeAnnotation,
          ),
          [],
        ),
      );
      const baseReference = tsTypeReference(identifier(BASE_NAME));
      baseReference.typeParameters = typeParameterInstantiation;

      if (opaque) {
        result.push(uniqueSymbol(SYMBOL_NAME));
      }
      const symbolReference = opaque
        ? tsTypeQuery(identifier(SYMBOL_NAME))
        : tsLiteralType(stringLiteral(this._name));

      result.push(declareClass(CLASS_NAME, symbolReference, typeParameters));
      const classReference = tsTypeReference(identifier(CLASS_NAME));
      classReference.typeParameters = typeParameterInstantiation;

      const intersection: TSType[] = [];
      if (expose) {
        intersection.push(baseReference);
      }
      intersection.push(classReference);

      const typeAlias = tsTypeAliasDeclaration(
        id,
        typeParameters,
        expose
          ? tsIntersectionType([baseReference, classReference])
          : classReference,
      );
      addComment(
        typeAlias,
        'leading',
        '*\n' +
          [
            expose ? ' * @expose' : null,
            opaque ? ' * @opaque' : ' * @nominal',
            ' * @base ' + BASE_NAME,
          ]
            .filter(Boolean)
            .join('\n') +
          '\n',
      );
      result.push(typeAlias);
      const opaqueReference = tsTypeReference(id);
      opaqueReference.typeParameters = typeParameterInstantiation;

      this._addDefaultMethod(
        objectMethod(
          'method',
          identifier('unsafeCast'),
          [typeIdentifier('value', baseReference)],
          blockStatement([
            returnStatement(
              tsAsExpression(identifier('value'), tsAnyKeyword()),
            ),
          ]),
        ),
        tsTypeAnnotation(opaqueReference),
        typeParameters,
      );
      this._addDefaultMethod(
        objectMethod(
          'method',
          identifier('extract'),
          [typeIdentifier('value', opaqueReference)],
          blockStatement([
            returnStatement(
              expose
                ? identifier('value')
                : tsAsExpression(identifier('value'), tsAnyKeyword()),
            ),
          ]),
        ),
        tsTypeAnnotation(baseReference),
        typeParameters,
      );
      if (this._hasMethod('isValid')) {
        this._addDefaultMethod(
          objectMethod(
            'method',
            identifier('cast'),
            [typeIdentifier('value', baseReference)],
            blockStatement([
              ifStatement(
                unaryExpression(
                  '!',
                  callExpression(memberExpression(id, identifier('isValid')), [
                    identifier('value'),
                  ]),
                ),
                blockStatement([
                  throwStatement(
                    newExpression(identifier('TypeError'), [
                      binaryExpression(
                        '+',
                        stringLiteral(`Expected "${this._name}" but got: `),
                        callExpression(
                          memberExpression(
                            identifier('JSON'),
                            identifier('stringify'),
                          ),
                          [identifier('value')],
                        ),
                      ),
                    ]),
                  ),
                ]),
              ),
              returnStatement(
                tsAsExpression(identifier('value'), tsAnyKeyword()),
              ),
            ]),
          ),
          tsTypeAnnotation(opaqueReference),
          typeParameters,
        );
      }
      result.push(
        variableDeclaration('const', [
          variableDeclarator(id, objectExpression(this._methods)),
        ]),
      );

      if (this._export) {
        result.push(
          exportNamedDeclaration(null, [
            exportSpecifier(identifier(this._name), identifier(this._name)),
          ]),
        );
      }

      placeholder.replace(result);
    }
  }
}
class Types {
  private _types = new Map<string, Type>();
  private _typesList: Type[] = [];
  get(name: string) {
    const cached = this._types.get(name);
    if (cached) return cached;
    const fresh = new Type(name);
    this._types.set(name, fresh);
    this._typesList.push(fresh);
    return fresh;
  }
  resolve(statements: ReadonlyArray<Statement | Placeholder>): Statement[] {
    this._typesList.forEach(type => type.resolve());
    const result: Statement[] = [];
    statements.forEach(s => {
      if (s instanceof Placeholder) {
        result.push(...s.resolve());
      } else {
        result.push(s);
      }
    });
    return result;
  }
}
export default function tranformAST(file: File): File {
  const statements = file.program.body;
  const result: Array<Statement | Placeholder> = [];
  const types = new Types();

  function push(statement: Statement | Placeholder) {
    if (!(statement instanceof Placeholder)) {
      if (statement.trailingComments) {
        statement.trailingComments = statement.trailingComments.filter(
          comment =>
            !/\@opaque/.test(comment.value) &&
            !/\@nominal/.test(comment.value) &&
            !/\@expose/.test(comment.value),
        );
      }
    }
    result.push(statement);
  }
  function handle(statement: Statement, root: Statement = statement) {
    if (isTSTypeAliasDeclaration(statement)) {
      // id: Identifier;
      // typeParameters: TSTypeParameterDeclaration | null;
      // typeAnnotation: TSType;
      // declare: boolean | null;
      push(types.get(statement.id.name).addBaseType(statement, root));
    } else if (
      isVariableDeclaration(statement) &&
      statement.declarations.length === 1
    ) {
      const declaration = statement.declarations[0];
      if (
        isIdentifier(declaration.id) &&
        declaration.init &&
        (isObjectExpression(declaration.init) || isIdentifier(declaration.init))
      ) {
        push(types.get(declaration.id.name).addMethods(declaration.init, root));
      } else {
        push(root);
      }
    } else if (isExportNamedDeclaration(statement) && statement.declaration) {
      handle(statement.declaration, statement);
    } else {
      push(root);
    }
  }

  statements.forEach(statement => {
    handle(statement);
  });
  file.program.body = types.resolve(result);
  return file;
}
