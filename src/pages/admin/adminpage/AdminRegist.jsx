import React, { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Radio from "@/components/common/Radio";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function AdminRegist() {
  const [form, setForm] = useState({
    role: "NORMAL_ADMIN",
    status: "active",
    name: "",
    gender: "male",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
  });
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [errors, setErrors] = useState({
    name: "",
    username: "",
  });

  // const getRoleValue = (role) => {
  //   switch (role) {
  //     case "admin":
  //       return "NORMAL_ADMIN";
  //     case "retail":
  //       return "RETAIL_ADMIN";
  //     case "manager":
  //       return "OFFICE_ADMIN";
  //     default:
  //       return "NORMAL_ADMIN";
  //   }
  // };

  const handleChange = (key, value) => {
    if (key === "name") {
      const hasNumber = /\d/; // 숫자 포함 여부 검사

      if (hasNumber.test(value)) {
        setErrors((prev) => ({
          ...prev,
          name: "이름에는 숫자를 입력할 수 없습니다.",
        }));
        return;
      }

      if (value.length > 10) {
        setErrors((prev) => ({
          ...prev,
          name: "이름은 최대 10자까지 입력 가능합니다.",
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, name: "" }));
    }

    // 아이디 유효성 처리
    if (key === "username") {
      const usernameRegex = /^[a-z0-9]{0,16}$/;
      if (!usernameRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          username: "영소문자와 숫자만 입력할 수 있습니다 (4~16자).",
        }));
      } else {
        setErrors((prev) => ({ ...prev, username: "" }));
      }
    }

    if (key === "phone") {
      const numeric = value.replace(/\D/g, "");
      if (numeric.length > 8) return; // 8자리 초과 방지
      setForm((prev) => ({ ...prev, phone: numeric }));
      setErrors((prev) => ({ ...prev, phone: false }));
      return;
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.username) {
      showModal({
        title: "필수 입력",
        message: "모든 필수 항목을 입력해주세요.",
        showCancel: false,
      });
      return;
    }

    const usernameRegex = /^[a-z0-9]{4,16}$/;
    if (!usernameRegex.test(form.username)) {
      showModal({
        title: "아이디 오류",
        message: "아이디는 4~16자의 영소문자와 숫자만 사용 가능합니다.",
        showCancel: false,
      });
      return;
    }

    if (!form.email) {
      showModal({
        title: "필수 입력",
        message: "모든 필수 항목을 입력해주세요.",
        showCancel: false,
      });
      return;
    }

    if (!form.name || !form.password || !form.confirmPassword || !form.phone) {
      showModal({
        title: "필수 항목 확인",
        message: "모든 필수 항목을 입력해주세요.",
        showCancel: false,
      });
      return;
    }

    const phoneDigitsOnly = form.phone.replace(/\D/g, "");
    if (phoneDigitsOnly.length !== 8) {
      showModal({
        title: "전화번호 오류",
        message: "전화번호는 숫자만 입력하며, 8자리여야 합니다.",
        showCancel: false,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      showModal({
        title: "이메일 오류",
        message: "올바른 이메일 형식이 아닙니다.",
        showCancel: false,
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      showModal({
        title: "비밀번호 불일치",
        message: "비밀번호가 일치하지 않습니다.",
        showCancel: false,
      });
      return;
    }

    const payload = {
      username: form.username,
      password: form.password,
      passwordConfirm: form.confirmPassword,
      name: form.name,
      phoneNumber: `010-${form.phone?.replace(/[^0-9]/g, "").replace(/(\d{4})(\d{4})/, "$1-$2")}`,

      email: form.email,
      gender:
        form.gender === "male" ? "M" : form.gender === "female" ? "W" : null,

      role: form.role,
      // companyId: 4,
      isAdmin: "Y",
      isUse: form.status === "active" ? "Y" : "N",
      isManager: "N",
      isReservation: "Y",
    };

    showModal({
      title: "등록 확인",
      message: "관리자 계정을 등록하시겠습니까?",
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await api.post("/api/v1/user/admin/insert", payload);
          if (res.data.success) {
            showModal({
              title: "저장 완료",
              message: "등록이 완료되었습니다.",
              showCancel: false,
              onConfirm: () => navigate("/admin/list"),
            });
          } else {
            showModal({
              title: "등록 실패",
              message: res.data.message || "등록에 실패했습니다.",
              showCancel: false,
            });
          }
        } catch (error) {
          const message = error?.response?.data?.message || "";

          if (message.includes("중복된 아이디가 존재합니다")) {
            showModal({
              title: "중복 아이디",
              message:
                "이미 존재하는 아이디입니다. 다른 아이디를 입력해주세요.",
              showCancel: false,
            });
          } else {
            showModal({
              title: "등록 실패",
              message: "서버 오류로 등록을 완료하지 못했습니다.",
              showCancel: false,
            });
          }
        }
      },
    });
  };

  return (
    <div className="max-w mx-auto space-y-6 rounded-lg bg-white p-6 shadow-md">
      {/* 라디오 그룹: 계정 유형 & 사용 여부 */}
      <div className="flex flex-wrap gap-8">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">계정 유형</p>
          <div className="flex gap-4">
            <Radio
              name="role"
              label="일반"
              value="NORMAL_ADMIN"
              checked={form.role === "NORMAL_ADMIN"}
              onChange={() => handleChange("role", "NORMAL_ADMIN")}
            />
            <Radio
              name="role"
              label="콘텐츠"
              value="CONTENTS_ADMIN"
              checked={form.role === "CONTENTS_ADMIN"}
              onChange={() => handleChange("role", "CONTENTS_ADMIN")}
            />
            <Radio
              name="role"
              label="오피스"
              value="OFFICE_ADMIN"
              checked={form.role === "OFFICE_ADMIN"}
              onChange={() => handleChange("role", "OFFICE_ADMIN")}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">사용 여부</p>
          <div className="flex gap-4">
            <Radio
              name="status"
              label="사용"
              value="active"
              checked={form.status === "active"}
              onChange={() => handleChange("status", "active")}
            />
            <Radio
              name="status"
              label="미사용"
              value="inactive"
              checked={form.status === "inactive"}
              onChange={() => handleChange("status", "inactive")}
            />
          </div>
        </div>
      </div>

      {/* 입력 필드 및 성별 라디오 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="이름"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          error={errors.name}
        />
        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">성별</p>
          <div className="flex gap-4">
            <Radio
              name="gender"
              label="남"
              value="male"
              checked={form.gender === "male"}
              onChange={() => handleChange("gender", "male")}
            />
            <Radio
              name="gender"
              label="여"
              value="female"
              checked={form.gender === "female"}
              onChange={() => handleChange("gender", "female")}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Input
          label="아이디"
          value={form.username}
          onChange={(e) => handleChange("username", e.target.value)}
          required
          error={errors.username}
          placeholder="4~16자 내의 영소문자,숫자로 구성"
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="비밀번호"
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          required
        />
        <Input
          label="비밀번호 확인"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          required
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800">
            전화번호
            <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <span className="rounded-l-md px-3 py-2 text-base whitespace-nowrap">
              010 -
            </span>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              maxLength={8}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="1234-5678"
              className="w-full"
            />
          </div>
        </div>
        <Input
          label="이메일"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleSubmit}>등록</Button>
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message:
                "목록으로 이동하면 작성한 정보가 사라집니다. 이동하시겠습니까?",
              showCancel: true,
              onConfirm: () => navigate("/admin/list"),
            })
          }
        >
          목록
        </Button>
      </div>
    </div>
  );
}
