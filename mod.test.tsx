import { createRegistrationContext } from "./mod.tsx";
import { render, act } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { JSDOM } from "jsdom";
import { expect } from "@std/expect";
import { create } from "zustand";

interface TestState {
  acted: boolean;
}

const useTestStore = create<TestState>(() => ({
  acted: false,
}));

function domTest(test: () => Promise<void>) {
  return async () => {
    const defaultHtml =
      '<!doctype html><html lang="en"><head title="For testing"><meta charset="utf-8"></head><body></body></html>';
    const jsdom = new JSDOM(defaultHtml);
    const { window } = jsdom;
    const { document } = window;
    globalThis.document = document;
    globalThis.window = window;

    useTestStore.setState(useTestStore.getInitialState());

    await test();
  };
}

const [Provider, useRegisterValue, useValues] =
  createRegistrationContext<string>();

function Parent({ children }: PropsWithChildren) {
  const values = useValues();

  return (
    <div data-testid="parent">
      {values.map((x, i) => (
        <p key={i}>{x}</p>
      ))}
      {children}
    </div>
  );
}

interface ChildProps {
  value: string;
}

function Child({ value }: ChildProps) {
  useRegisterValue(value);
  return null;
}

Deno.test(
  "CanRenderEmptyProvider",
  domTest(async () => {
    const dom = await render(
      <Provider>
        <Parent></Parent>
      </Provider>
    );

    const parent = await dom.findByTestId("parent");

    expect(parent.children.length).toBe(0);
  })
);

Deno.test(
  "CanRender1Child",
  domTest(async () => {
    const dom = await render(
      <Provider>
        <Parent>
          <Child value="Test" />
        </Parent>
      </Provider>
    );

    const testElement = await dom.findByText("Test");

    expect(testElement).toBeDefined();
  })
);

Deno.test(
  "CanRenderMultipleChild",
  domTest(async () => {
    const dom = await render(
      <Provider>
        <Parent>
          <Child value="Test1" />
          <Child value="Test2" />
        </Parent>
      </Provider>
    );

    const testElement1 = await dom.findByText("Test1");
    const testElement2 = await dom.findByText("Test2");

    expect(testElement1).toBeDefined();
    expect(testElement2).toBeDefined();
  })
);

Deno.test(
  "ChildCountIncrease",
  domTest(async () => {
    function TestComponent() {
      const state = useTestStore();
      return (
        <Provider>
          <Parent>{state.acted && <Child value="Test1" />}</Parent>
        </Provider>
      );
    }

    const dom = await render(<TestComponent />);

    const testComponent1 = await dom.findByTestId("parent");

    expect(testComponent1.children.length).toBe(0);

    await act(() => {
      useTestStore.setState({ acted: true });
    });

    expect(testComponent1.children.length).toBe(1);
  })
);

Deno.test(
  "ChildCountDecrease",
  domTest(async () => {
    function TestComponent() {
      const state = useTestStore();
      return (
        <Provider>
          <Parent>{!state.acted && <Child value="Test1" />}</Parent>
        </Provider>
      );
    }

    const dom = await render(<TestComponent />);

    const testComponent1 = await dom.findByTestId("parent");

    expect(testComponent1.children.length).toBe(1);

    await act(() => {
      useTestStore.setState({ acted: true });
    });

    expect(testComponent1.children.length).toBe(0);
  })
);
