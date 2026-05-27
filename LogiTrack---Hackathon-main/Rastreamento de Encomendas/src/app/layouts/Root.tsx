import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <Toaster position="top-center" />
    </div>
  );
}
