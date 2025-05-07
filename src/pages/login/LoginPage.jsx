import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Checkbox from "@/components/common/Checkbox";
import useModal from "@/hooks/useModal";
import PasswordResetModal from "@/components/modal/PasswordResetModal";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [saveId, setSaveId] = useState(false);
  const { showModal } = useModal();

  const handleLogin = async (e) => {
    e.preventDefault();

    // TODO: SIGN API
    setAccessToken("dummy");
    // TODO: GET ME INFO API
    // await getUserInfo();

    navigate("/");
  };

  return (
    <div
  className="flex flex-col min-h-screen items-center justify-center bg-white px-4 font-sans dark:bg-white"
>
<img
    src="/src/img/ONE GROVE.png" // 실제 경로로 변경하세요
    alt="ONE GROVE 로고"
    className="mx-auto h-20 w-auto mb-10"
  />
<div
  className={
    "w-full max-w-sm rounded-lg bg-white p-6 pb-10 "
  }
>
        
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
          <Button type={"submit"} className="w-full py-3 bg-black text-white hover:bg-gray-800">
            로그인
          </Button>
          <div className="mt-4 flex justify-between items-center text-sm">
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
  className="text-gray-600 underline hover:text-black text-sm"
>
  비밀번호 찾기
</button>

</div>
        </form>
      </div>
    </div>
  );
}
