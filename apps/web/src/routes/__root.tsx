import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "../styles/global.css";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="container mx-auto flex-1">
          <Outlet />
        </div>
      </div>
      <Toaster />
      <TanStackRouterDevtools />
    </>
  ),
});
