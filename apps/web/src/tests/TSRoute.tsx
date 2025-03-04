import { routeTree } from "@/routeTree.gen";
import {
  createRouter,
  RouteComponent,
  RouterProvider,
} from "@tanstack/react-router";

const router = createRouter({ routeTree });

const TSRouter = ({ children }: { children: React.ReactNode }) => {
  return (
    <RouterProvider
      router={router}
      defaultComponent={children as unknown as RouteComponent}
    />
  );
};

export default TSRouter;
