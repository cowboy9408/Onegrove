import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div>
      403
      <Link to={"/"}>Home 으로 가기</Link>
    </div>
  );
}
