/**
 * @generated opaque-types
 */

export type Latitude__Base = number;

declare class Latitude__Class {
  private __kind: 'Latitude';
}

/**
 * @expose
 * @nominal
 * @base Latitude__Base
 */
type Latitude = Latitude__Base & Latitude__Class;
const Latitude = {
  extract(value: Latitude): Latitude__Base {
    return value;
  },

  unsafeCast(value: Latitude__Base): Latitude {
    return value as any;
  },
};
export {Latitude};
export type Longitude__Base = number;

declare class Longitude__Class {
  private __kind: 'Longitude';
}

/**
 * @expose
 * @nominal
 * @base Longitude__Base
 */
type Longitude = Longitude__Base & Longitude__Class;
const Longitude = {
  extract(value: Longitude): Longitude__Base {
    return value;
  },

  unsafeCast(value: Longitude__Base): Longitude {
    return value as any;
  },
};
export {Longitude};
export type ID__Base = number;
declare const ID__Symbol: unique symbol;

declare class ID__Class {
  private __kind: typeof ID__Symbol;
}

/**
 * @opaque
 * @base ID__Base
 */
type ID = typeof ID__Symbol & ID__Class;
const ID = {
  cast(value: ID__Base): ID {
    if (!ID.isValid(value)) {
      throw new TypeError('Expected "ID" but got: ' + JSON.stringify(value));
    }

    return value as any;
  },

  extract(value: ID): ID__Base {
    return value as any;
  },

  unsafeCast(value: ID__Base): ID {
    return value as any;
  },

  isValid(id: any): boolean {
    return (
      typeof id === 'number' &&
      !Number.isNaN(id) &&
      id < Number.MAX_SAFE_INTEGER &&
      id >= 0 &&
      id === Math.floor(id)
    );
  },
};
export {ID};
export type MyThing__Base<T> = {
  foo(): T;
};
declare const MyThing__Symbol: unique symbol;

declare class MyThing__Class<T> {
  private __kind: typeof MyThing__Symbol;
  private __T: T;
}

/**
 * @opaque
 * @base MyThing__Base
 */
type MyThing<T> = typeof MyThing__Symbol & MyThing__Class<T>;
const MyThing = {
  extract<T>(value: MyThing<T>): MyThing__Base<T> {
    return value as any;
  },

  unsafeCast<T>(value: MyThing__Base<T>): MyThing<T> {
    return value as any;
  },
};
export default MyThing;
export type Email__Base = string;

declare class Email__Class {
  private __kind: 'Email';
}

/**
 * @expose
 * @nominal
 * @base Email__Base
 */
type Email = Email__Base & Email__Class;
const Email = {
  cast(value: Email__Base): Email {
    if (!Email.isValid(value)) {
      throw new TypeError('Expected "Email" but got: ' + JSON.stringify(value));
    }

    return value as any;
  },

  extract(value: Email): Email__Base {
    return value;
  },

  unsafeCast(value: Email__Base): Email {
    return value as any;
  },

  isValid(email: string): email is Email {
    return /.+\@.+/.test(email);
  },
};
export {Email};
