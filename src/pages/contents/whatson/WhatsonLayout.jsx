import { Outlet } from "react-router-dom";

export default function WhatsonLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
