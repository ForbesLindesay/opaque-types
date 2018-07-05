import MyThing, {Longitude, Latitude, ID} from './example';

const x = Longitude.unsafeCast(10);
const y = Latitude.unsafeCast(5);
const i = ID.cast(100);

export function go(
  id: ID,
  longitude: Longitude,
  latitude: Latitude,
  value: number,
) {}

go(i, x, y, 0);
go(i, x, y, x);
go(i, x, y, y);
go(i, x, y, ID.extract(i));
// errors:
// go(i, y, x, 0);
// errors:
// go(i, x, y, i);
// errors:
// go(0, x, y, 0);

export function thing<T>(t: MyThing<T>) {}

thing<string>(
  MyThing.unsafeCast({
    foo() {
      return '';
    },
  }),
);

// errors:
// thing<string>(
//   MyThing.unsafeCast({
//     foo() {
//       return 42;
//     },
//   }),
// );

// errors:
// thing<string>({
//   foo() {
//     return '';
//   },
// });
