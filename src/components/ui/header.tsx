import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";
const Header = () => {
  return (
    <header className="border-b shadow-md">
      <div className="flex items-center justify-between px-10 py-2">
        {/* Logo */}
        <Link to="/">
          <p className="text-xl font-bold">Ux Lab</p>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost">
            <Folder className="size-4" />
            <span>Create project</span>
          </Button>
          <Button>
            <Plus className="size-4" />
            <span>Create study</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
