import React from 'react';

// exmaple component we want to extra the props from
function SomeComponent(props: {
  foo: string;
  bar: {
    baz: number;
    qux: string;
  };
}) {
  return null;
}


type GetProps<TComponent>