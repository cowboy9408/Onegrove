import { Outlet } from "react-router-dom";

export default function SubmainLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
