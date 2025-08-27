import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import api from "@/lib/apiClient";

export default function PasswordResetModal({ closeModal }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const handleConfirm = async () => {
    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      await api.post("/api/v1/user/find-password", { username, email });
      alert("임시 비밀번호가 발송되었습니다.");
      closeModal();
    } catch (error) {
      console.error("비밀번호 찾기 오류:", error);
      alert("일치하는 아이디/이메일이 없습니다. 정보를 다시 확인해주세요.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 1) 아이디 입력 */}
      <Input
        placeholder="아이디를 입력하세요"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full"
      />

      {/* 2) 이메일 입력 */}
      <Input
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full"
      />

      {/* 3) 안내 문구 */}
      <p className="text-left text-sm text-gray-500">
        입력하신 이메일로 저장된 아이디의 임시 비밀번호가 발송됩니다.
      </p>

      {/* 액션 버튼 */}
      <Button
        className="mt-2 h-12 w-full bg-black text-white hover:bg-gray-800"
        onClick={handleConfirm}
      >
        확인
      </Button>
    </div>
  );
}
