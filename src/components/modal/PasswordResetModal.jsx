import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import api from "@/lib/apiClient";

export default function PasswordResetModal({ closeModal }) {
  const [email, setEmail] = useState("");

  const handleConfirm = async () => {
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
      await api.post("/api/v1/user/find-password", { email });
      alert("임시 비밀번호가 발송되었습니다.");
      closeModal();
    } catch (error) {
      console.error("비밀번호 찾기 오류:", error);
      alert("비밀번호 재설정 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex h-50 flex-col justify-between">
      <Input
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="absolute top-11 left-0 w-full"
      />
      <p className="mt-2 mb-30 text-left text-sm text-gray-500">
        입력하신 이메일로 저장된 아이디의 임시 비밀번호가 발송됩니다.
      </p>
      <Button
        className="h-12 w-full bg-black text-white hover:bg-gray-800"
        onClick={handleConfirm}
      >
        확인
      </Button>
    </div>
  );
}
