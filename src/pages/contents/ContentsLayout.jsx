import { Outlet } from "react-router-dom";

export default function ContentsLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
