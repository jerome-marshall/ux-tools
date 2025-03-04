import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <p className="text-sm text-muted-foreground">
        Go to <Link to="/dashboard">dashboard</Link>
      </p>
    </div>
  );
}
