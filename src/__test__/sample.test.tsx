import { api } from "../utils/api";
import { renderWithProviders, trpcMsw } from "./setup";
import { describe, expect, beforeAll, afterAll, it } from "vitest";

function Greeting() {
  const greeting = api.example.hello.useQuery({ text: "world" });
  return <h1>{greeting.data?.greeting ?? "no data"}</h1>;
}

import { setupServer } from "msw/node";
import { screen, waitFor } from "@testing-library/react";

const server = setupServer(
  trpcMsw.example.hello.query((req, res, ctx) => {
    // TODO:
    // either have `getInput` return `json` because it knows our transformer (preferred)
    // or at least type `getInput` correctly (might require a PR to msw-trpc)
    const request = req.getInput().json;
    return res(
      ctx.status(200),
      // TODO: fix type issues here
      ctx.data({
        greeting: `Hello ${request.text}!`,
      })
    );
  })
);

describe("BestCat", () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  it("should render the result of the query", async () => {
    renderWithProviders(<Greeting />);
    const noData = screen.getByText(/no data/i);
    expect(noData).toBeInTheDocument();
    await waitFor(() => {
      const helloWorld = screen.getByText(/Hello world/i);
      expect(helloWorld).toBeVisible();
    });
  });
});
