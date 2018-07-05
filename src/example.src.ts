// @expose
// @nominal
export type Latitude = number;
// @expose
// @nominal
export type Longitude = number;

// @opaque
export type ID = number;
export const ID = {
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

// @opaque
type MyThing<T> = {foo(): T};
export default MyThing;

// @nominal
// @expose
export type Email = string;
export const Email = {
  isValid(email: string): email is Email {
    return /.+\@.+/.test(email);
  },
};
