# opaque-types

Support for opaque and nominal types in typescript via a transformation.

[![Build Status](https://img.shields.io/travis/ForbesLindesay/opaque-types/master.svg)](https://travis-ci.org/ForbesLindesay/opaque-types) [![Greenkeeper badge](https://badges.greenkeeper.io/ForbesLindesay/opaque-types.svg)](https://greenkeeper.io/)

## Installation

    yarn add opaque-types

## Usage

Define a file with the extension `.src.ts`. e.g. `types.src.ts`

```typescript
// @nominal
export type Longitude = number;
// @nominal
export type Latitude = number;

// @opaque
export type UserID = number;

// @nominal
// @expose
export type Email = string;
export const Email = {
  isValid(email: string): email is Email {
    return /.+\@.+/.test(email);
  },
};
```

This will generate a file called `types.ts` (i.e. without the `.src` part), that exposes opaque/nominal types, along with an API for casting to and from them.

Usage:

```typescript
import {Longitude, Latitude, UserID, Email} from './types';

const i = UserID.unsafeCast(100);
const x = Longitude.unsafeCast(10);
const y = Latitude.unsafeCast(5);

export function go(id: UserID, longitude: Longitude, latitude: Latitude) {}

go(i, x, y);
// errors: go(i, y, x);

// errors: const a: number = x;
// errors: const b: number = y;
const a: number = Longitude.extract(x);
const b: number = Longitude.extract(y);

// cast validates the value. It is only
// available if `isValid` is defined.
const email = Email.cast('forbes@example.com');
const str: string = email;
// errors: const e: Email = 'forbes@example.com';
function sendMessage(email: Email, body: string) {}
sendMessage(email, 'Hi person at ' + email);
```

- `@nominal` marks the type as a "nominal" type. If you declare the same "nominal" type, with the same name, in multiple different files, they will be treated as the same type. This is useful if you want to create a library that exposes an API with types like "Email".
- `@opaque` marks the type as an "opaque" type. Each declaration of an `@opaque` type is separate, and cannot be confused, even if they have the same name.
- `@expose` exposes the underlying type. In the above example, you can use an `Email` in a location where a `string` is required, but you still cannot pass an arbitrary string to a method expecting an `Email`.

## License

MIT
