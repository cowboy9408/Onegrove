"use client";
import { useState, useMemo } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import api from "@/lib/apiClient"; // 기존 axios 래퍼

/**
 * 최초 로그인 시 노출되는 비밀번호 변경 모달
 * - 현재 비밀번호 / 새 비밀번호 / 새 비밀번호 확인
 * - /api/v1/user/change-password POST
 */
export default function ChangePasswordModal({ closeModal, onSuccess }) {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 간단 유효성: 모두 입력 + 새 비번 일치 + 현재/새 비번 달라야 함
  const isValid = useMemo(() => {
    if (!password.trim() || !newPassword.trim() || !confirmPassword.trim())
      return false;
    if (newPassword !== confirmPassword) return false;
    if (password === newPassword) return false;
    return true;
  }, [password, newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isValid) {
      setErrorMessage(
        "입력값을 확인해주세요. 새 비밀번호와 확인값이 일치해야 하며, 기존 비밀번호와 달라야 합니다."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        password: password.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      };

      const res = await api.post("/api/v1/user/change-password", payload);
      const { data, status } = res || {};

      const ok =
        status === 200 ||
        status === 204 ||
        data?.success === true ||
        data?.status === 200 ||
        data?.status === "200" ||
        data?.code === 200 ||
        data?.result === "OK";

      if (ok) {
        setSuccessMessage(data?.message || "비밀번호가 변경되었습니다.");
        // 부모가 onSuccess를 넘겼다면 우선 실행 → 없으면 모달만 닫기
        if (typeof onSuccess === "function") {
          onSuccess();
        } else {
          closeModal?.();
        }
      } else {
        throw new Error(data?.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      // 서버에서 주는 메시지 우선 노출(없으면 기본 메시지)
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.";
      setErrorMessage(String(serverMsg));
      console.error("[change-password] error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      {/* 상단 안내 문구 */}
      <div className="mb-2">
        <h2 className="mb-1 text-lg font-semibold">비밀번호 변경 안내</h2>
        <p className="text-f12 lg:text-f14 text-themeBlack">
          개인 정보를 보호하고, 개인정보 도용으로 인한 피해 예방을 위해{" "}
          <span className="text-themeRed font-semibold">비밀번호 변경</span>을
          권장합니다.
        </p>
      </div>

      {/* 현재 비밀번호 */}
      <Input
        type="password"
        placeholder="현재 비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      {/* 변경할 비밀번호 */}
      <Input
        type="password"
        placeholder="변경할 비밀번호"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        autoComplete="new-password"
      />

      {/* 변경할 비밀번호 확인 */}
      <Input
        type="password"
        placeholder="변경할 비밀번호 확인"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
      />

      {/* 안내/에러 메시지 */}
      {errorMessage && (
        <p className="text-themeRed text-f12 lg:text-f14">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-f12 lg:text-f14 text-green-600">{successMessage}</p>
      )}

      {/* 확인 버튼 */}
      <Button
        type="submit"
        className="mt-2"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? "변경 중..." : "확인"}
      </Button>
    </form>
  );
}
