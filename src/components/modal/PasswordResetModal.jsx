import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function PasswordResetModal({ closeModal }) {
  const [email, setEmail] = useState("");

  const handleConfirm = () => {
    console.log("입력된 이메일:", email);
    // TODO: 이메일 전송 로직
    closeModal();
  };

  return (
    <div className="flex flex-col justify-between h-50 space-y-6">
      <Input
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="absolute top-11 w-full"
      />
      <p className="mt-2 text-sm text-gray-500 text-left">
  입력하신 이메일로 저장된 아이디의 임시 비밀번호가 발송됩니다.
</p>
      <Button
        className="w-full h-12 bg-black text-white hover:bg-gray-800"
        onClick={handleConfirm}
      >
        확인
      </Button>
    </div>
  );
}