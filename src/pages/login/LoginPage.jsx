import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getUserInfo } from "@/api/user";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setName = useAuthStore((state) => state.setName);

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await getUserInfo(username, password);

    setAccessToken(res.accessToken);
    setName(res.name);

    navigate("/");
  };

  return (
    <div
      className={
        "flex min-h-screen items-center justify-center bg-gray-100 px-4 font-sans dark:bg-gray-800"
      }
    >
      <div
        className={
          "w-full max-w-sm rounded-lg bg-white p-6 pb-10 shadow-lg dark:bg-black"
        }
      >
        <h4
          className={
            "mb-2 text-center text-2xl font-bold text-gray-700 dark:text-gray-200"
          }
        >
          Sign In
        </h4>
        <form onSubmit={handleLogin} className={"mt-4 space-y-5"}>
          <Input
            id={useId()}
            label={"Email"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            id={useId()}
            label={"Password"}
            type={"password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onClear={() => setPassword("")}
          />
          <Button type={"submit"} className="w-full py-3">
            로그인
          </Button>
        </form>
      </div>
    </div>
  );
}
