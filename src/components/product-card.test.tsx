import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCard } from "./product-card";
import type { Product } from "@/types";

const base: Product = {
  id: "p1",
  slug: "test-tee",
  name: "Test Tee",
  description: "A soft vintage tee.",
  details: [],
  price: 4200,
  category: "shirts",
  collection: "Vintage Hip Hop Tees",
  sizes: ["M"],
  colors: [{ name: "Black", hex: "#000000" }],
  images: ["/x.jpg"],
  tags: [],
  inStock: true,
};

describe("ProductCard", () => {
  it("renders the name and the price formatted from cents", () => {
    const { container } = render(
      <ProductCard product={{ ...base, price: 4299 }} />,
    );
    expect(screen.getByText("Test Tee")).toBeInTheDocument();
    expect(container.textContent).toContain("$42.99");
    expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
  });

  it("shows a Sold out badge when out of stock", () => {
    render(<ProductCard product={{ ...base, inStock: false }} />);
    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });
});
