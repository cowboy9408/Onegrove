import { Outlet } from "react-router-dom";

export default function StoriesLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
