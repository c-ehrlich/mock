import "@testing-library/jest-dom";
import { createTRPCReact, httpLink } from "@trpc/react-query";
import type { AppRouter } from "../server/api/root";
import superjson from "superjson";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { createTRPCMsw } from "msw-trpc";
import fetch from "node-fetch";

export const mockedTRPC = createTRPCReact<AppRouter>({
  unstable_overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn();
        await opts.queryClient.invalidateQueries();
      },
    },
  },
});

global.fetch = fetch;

const mockedTRPCClient = mockedTRPC.createClient({
  transformer: superjson,
  links: [httpLink({ url: "http://localhost:3000/api/trpc" })],
});

const mockedQueryClient = new QueryClient();

export const MockedTRPCProvider = (props: { children: React.ReactNode }) => {
  return (
    <mockedTRPC.Provider
      client={mockedTRPCClient}
      queryClient={mockedQueryClient}
    >
      <QueryClientProvider client={mockedQueryClient}>
        {props.children}
      </QueryClientProvider>
    </mockedTRPC.Provider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return render(ui, {
    wrapper: (props) => <MockedTRPCProvider {...props} />,
    ...options,
  });
};

export const trpcMsw = createTRPCMsw<AppRouter>({
  transformer: {
    input: superjson,
    output: superjson,
  },
});
