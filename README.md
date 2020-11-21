[![npm version](https://img.shields.io/npm/v/reactive-box?style=flat-square)](https://www.npmjs.com/package/reactive-box) [![bundle size](https://img.shields.io/bundlephobia/minzip/reactive-box?style=flat-square)](https://bundlephobia.com/result?p=reactive-box) [![code coverage](https://img.shields.io/coveralls/github/betula/reactive-box?style=flat-square)](https://coveralls.io/github/betula/reactive-box) [![typescript supported](https://img.shields.io/npm/types/typescript?style=flat-square)](./src/main.d.ts)

Minimalistic, [fast](https://github.com/betula/reactive-box-performance), and highly efficient reactivity.

API of library implemented by only thee functions:

+ `box` - is the container for an immutable value.
+ `sel` - is the cached selector (or computed value in another terminology) who will mark for recalculating on the next call If some of read inside boxes or selectors changed.
+ `expr` - is the expression who detects all boxes and selectors read inside and reacted If some of them changed.

Example with React:

```javascript
import React from "react";
import { box, sel, expr } from "reactive-box";

const [getCounter, setCounter] = box(0);
const [getNext] = sel(() => getCounter() + 1);

const increment = () => setCounter(getCounter() + 1);
const decrement = () => setCounter(getCounter() - 1);

const useForceUpdate = () => {
  return React.useReducer(() => [], [])[1];
};

const observe = <T extends React.FC<P>, P>(Component: T) =>
  React.memo((props: P) => {
    const forceUpdate = useForceUpdate();
    const ref = React.useRef<[T, () => void]>();
    if (!ref.current) {
      ref.current = expr(Component, forceUpdate);
    }
    React.useEffect(() => ref.current![1], []);
    return ref.current[0](props);
  });

const Counter = observe(() => (
  <p>
    Counter: {getCounter()} (next value: {getNext()})
  </p>
));

const Buttons = () => (
  <p>
    <button onClick={decrement}>Prev</button>
    <button onClick={increment}>Next</button>
  </p>
);

export const App = () => (
  <>
    <Counter />
    <Buttons />
  </>
);

```

[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/reactive-box-counter-35bp9?hidenavigation=1&module=%2Fsrc%2FApp.tsx)

More examples

- [Simple model with React on CodeSandbox](https://codesandbox.io/s/reactive-box-model-yopk5?hidenavigation=1&module=%2Fsrc%2FApp.tsx)
- [Mobx like Todos with React on CodeSandbox](https://codesandbox.io/s/reactive-box-todos-u5q3e?hidenavigation=1&module=%2Fsrc%2Fshared%2Ftodos.ts)

Install

```bash
npm i reactive-box
```

Enjoy!
