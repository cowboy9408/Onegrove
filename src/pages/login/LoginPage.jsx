import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useId, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Checkbox from "@/components/common/Checkbox";
import useModal from "@/hooks/useModal";
import PasswordResetModal from "@/components/modal/PasswordResetModal";
import { getUserInfo } from "@/api/user";
import { jwtDecode } from "jwt-decode";
import { extractErrorMessage } from "@/lib/utils";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const [saveId, setSaveId] = useState(false);
  const { showModal } = useModal();
  const setName = useAuthStore((state) => state.setName);
  const setCompanyId = useAuthStore((state) => state.setCompanyId);
  const [isComposing, setIsComposing] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    if (isComposing) {
      // 조합 중에는 그대로 입력
      setUsername(value.trim());
    } else {
      // 조합이 끝난 후에만 필터 적용
      setUsername(value.replace(/[^가-힣a-zA-Z0-9\s]/g, ""))
        .replace(/\s/g, "")
        .trim();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await getUserInfo(username, password);
      console.log("로그인 응답 확인:", res);
      console.log("accessToken 디코드", jwtDecode(res.accessToken));

      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setName(res.name);
      setCompanyId(res.companyId);

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);

      navigate("/");
    } catch (err) {
      console.error("로그인 실패", err);

      showModal({
        title: "로그인 실패",
        message: extractErrorMessage(
          err,
          "로그인에 실패했습니다. 다시 시도해주세요."
        ),
        showCancel: true,
      });
    }
  };

  useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("refreshToken");
  }, []);

  const handleSaveId = (e) => {
    setSaveId(e.target.checked);

    if (!e.target.checked) {
      localStorage.removeItem("savedUserId");
      setSaveId(false)
    } else {
      localStorage.setItem("savedUserId", username);
    }
    console.log(localStorage.getItem("savedUserId"));
  };

  // 저장된 아이디 불러오기
  useEffect(() => {
    const savedId = localStorage.getItem("savedUserId");

    if (savedId) {
      setUsername(savedId);
      setSaveId(true);
    }
  }, []);

  // 아이디 저장 이미 체크된 경우, 입력이 업데이트 되면 자동저장
  useEffect(() => {
    if (saveId) {
      localStorage.setItem("savedUserId", username)
    }
  }, [username])


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 font-sans dark:bg-white">
      <img
        src="/img/ONE GROVE.png"
        alt="ONE GROVE 로고"
        className="mx-auto mb-10 h-auto w-auto"
      />
      <div className={"w-full max-w-sm rounded-lg bg-white p-6 pb-10"}>
        <form onSubmit={handleLogin} className={"mt-4 space-y-5 text-black"}>
          <Input
            id={useId()}
            label={""}
            placeholder={"ID"}
            value={username.trim()}
            // onChange={(e) => setUsername(e.target.value)}
            onChange={handleChange}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              // 조합 끝난 값도 정제
              setUsername(
                e.target.value
                  .replace(/[^가-힣a-zA-Z0-9\s]/g, "")
                  .replace(/\s/g, "")
                  .trim()
              );
            }}
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
              onChange={handleSaveId}
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
