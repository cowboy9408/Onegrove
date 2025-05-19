import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Checkbox from "@/components/common/Checkbox";
import useModal from "@/hooks/useModal";
import PasswordResetModal from "@/components/modal/PasswordResetModal";
import { getUserInfo } from "@/api/user";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const [saveId, setSaveId] = useState(false);
  const { showModal } = useModal();
  const setName = useAuthStore((state) => state.setName);

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await getUserInfo(username, password);
    console.log("로그인 응답 확인:", res);

    setAccessToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setName(res.name);

    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);

    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 font-sans dark:bg-white">
      <img
        src="/public/img/ONE GROVE.png"
        alt="ONE GROVE 로고"
        className="mx-auto mb-10 h-20 w-auto"
      />
      <div className={"w-full max-w-sm rounded-lg bg-white p-6 pb-10"}>
        <form onSubmit={handleLogin} className={"mt-4 space-y-5 text-black"}>
          <Input
            id={useId()}
            label={""}
            placeholder={"ID"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            id={useId()}
            label={""}
            placeholder={"password"}
            type={"password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onClear={() => setPassword("")}
          />
          <Button
            type={"submit"}
            className="w-full bg-black py-3 text-white hover:bg-gray-800"
          >
            로그인
          </Button>
          <div className="mt-4 flex items-center justify-between text-sm">
            <Checkbox
              id="saveId"
              label="아이디 저장"
              checked={saveId}
              onChange={(e) => setSaveId(e.target.checked)}
            />
            <button
              type="button"
              onClick={() =>
                showModal({
                  title: "비밀번호 찾기",
                  children: ({ closeModal }) => (
                    <PasswordResetModal closeModal={closeModal} />
                  ),
                  showCancel: true,
                  customButton: true,
                  size: "md",
                })
              }
              className="text-sm text-gray-600 underline hover:text-black"
            >
              비밀번호 찾기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
