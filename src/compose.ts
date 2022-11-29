declare const cannot_compose_functions: unique symbol;

type Composition = (arg: any) => any;

type ValidFunctionChain<T extends ((arg: never) => any)[]> = T extends [
  infer Current extends Composition,
  infer Next extends Composition,
  ...infer Future extends Composition[],
]
  ? [ReturnType<Current>] extends [Parameters<Next>[0]]
    ? ValidFunctionChain<[Next, ...Future]>
    : T extends [any, ...infer Future]
    ? Future['length']
    : never
  : true;

function composeFunctions<Composables extends [Composition, ...Composition[]]>(
  ...composables: ValidFunctionChain<Composables> extends infer Offset extends number
    ? setComposeError<
        Composables,
        Offset,
        'Return of previous function must match the input of the current function'
      >
    : Composables
) {
  return (
    current: Parameters<Composables[0]>[0],
  ): Composables extends [...any[], infer Last extends (arg: never) => any]
    ? ReturnType<Last>
    : never => {
    let v: any = current;
    for (const composable of composables) {
      v = (composable as any)(v);
    }
    return v;
  };
}

type setComposeError<
  T extends unknown[],
  Offset extends number,
  Item,
  $Draft extends unknown[] = [],
> = $Draft['length'] extends Offset
  ? $Draft extends [any, ...infer $After]
    ? [...T, Item, ...$After]
    : never
  : T extends [...infer $Before, infer $Item]
  ? setComposeError<$Before, Offset, Item, [$Item, ...$Draft]>
  : never;

const addOne = (a: number): number => a + 1;
const numToString = (a: number): string => a.toString();
const stringToNum = (a: string): number => parseFloat(a);

namespace Passing {
  composeFunctions(addOne, numToString, stringToNum);
  composeFunctions(addOne, addOne, addOne, addOne, addOne, numToString);
  composeFunctions(numToString, stringToNum, addOne);
  composeFunctions(addOne, addOne, addOne);
}

namespace Failing {
  composeFunctions(addOne, stringToNum);
  composeFunctions(numToString, addOne);
  composeFunctions(stringToNum, stringToNum);
  composeFunctions(addOne, addOne, addOne, addOne, stringToNum);
  composeFunctions(addOne, addOne, addOne, addOne, stringToNum, addOne);
}

const addThree = composeFunctions(addOne, addOne, addOne);

console.log(addThree(0));
