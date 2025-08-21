# Registration Context

## Objective

Registration Context provides a lightweight API that children can use to register values with a parent.

It provides a convenient way for children to hoist registration information up to their parents.

## Example

```tsx
const [MyContextProvider, useRegisterMyValue, useMyValues] = createRegistrationContext<string>();

function Host(){
  return <MyContextProvider><Parent/></MyContextProvider>
}

function Parent(){
  const values = useMyValues();

  return <>
    {values.map(value => <p>{value}</p>)}
    <Child/>
  </>;
}

function Child(){

  useRegisterMyValue("I'm a child");

  return <p>I register myself</p>;
}
```

The above example will render the following react tree

```xml
<Host>
  <MyContextProvider>
  <Parent>
    <p>I'm a child</p>
    <Child>
      <p>I register myself</p>
    </Child>
  </Parent>
  </MyContextProvider>
</Host>
```