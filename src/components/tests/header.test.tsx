import { expect, test } from "vitest";
import { customRender, screen } from "@/tests/test-utils";
import Header from "../header";

test("renders header", async () => {
  await customRender(<Header />);
  expect(screen.getByText("Ux Lab")).toBeInTheDocument();
});
