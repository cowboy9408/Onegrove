import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <div>403 에러</div>
      <Link to={"/"} className="underline">Home 으로 가기</Link>
    </div>
  );
}
