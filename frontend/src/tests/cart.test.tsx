import { render, screen } from "@testing-library/react";
import Cart from "../pages/shopPage/Cart/Cart";

test("renders example component", () => {
  render(<Cart closeCart={() => {}} />);
  expect(screen.getByText("Varukorg")).toBeInTheDocument();
});
