import { render, RenderOptions, act, screen } from "@testing-library/react";
import { ReactElement } from "react";
import TSRouter from "./TSRoute";

/**
 * Custom render function that wraps components with TSRouter and handles act()
 */
export async function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  // Create a container to hold the result
  let renderResult: ReturnType<typeof render>;

  // Use act to wrap the render
  await act(async () => {
    renderResult = render(ui, {
      wrapper: ({ children }) => <TSRouter>{children}</TSRouter>,
      ...options,
    });

    // Add a small delay to allow TanStack Router to complete its initialization
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return renderResult!;
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Export screen explicitly for better TypeScript support
export { screen };
