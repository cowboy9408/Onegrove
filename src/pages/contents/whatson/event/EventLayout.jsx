import { Outlet } from "react-router-dom";

export default function EventLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
