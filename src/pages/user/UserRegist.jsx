import React, { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Radio from "@/components/common/Radio";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";
import Select from "@/components/common/Select";

export default function AdminRegist() {
  const [form, setForm] = useState({
    status: "active",
    name: "",
    gender: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
    isReservation: "N",
  });
  const navigate = useNavigate();

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
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
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

      role: "MEMBER", // 고정
      companyId: 5,
      isAdmin: "N", // 고정
      isUse: form.status === "active" ? "Y" : "N",
      isManager: "N", // 고정
      isReservation: form.isReservation,
    };

    try {
      await api.post("/api/v1/user/member/insert", payload);
      alert("등록이 완료되었습니다.");
      navigate("/user");
    } catch (error) {
      console.error("등록 오류:", error);
      alert("등록에 실패했습니다. 관리자에게 문의하세요.");
    }
  };

  return (
    <div className="max-w mx-auto space-y-6 rounded-lg bg-white p-6 shadow-md">
      {/* 라디오 그룹: 계정 유형 & 사용 여부 */}
      <div className="flex flex-wrap gap-8">
        <div>
          <Select
            label="입주사"
            value={form.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="w-[735px]"
            required
          >
            <option value="">선택하세요</option>
            <option value="LG">입주사1</option>
            <option value="삼성">입주사2</option>
            <option value="카카오">입주사3</option>
          </Select>
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
          <div className="flex items-center">
            <span className="rounded-l-md px-3 py-2 text-base">010 -</span>

            <div className="w-[670px]">
              <Input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="rounded-l-none"
                placeholder="1234-5678"
              />
            </div>
          </div>
        </div>
        <Input
          label="이메일"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-800">
          회의실 예약 기능
        </p>
        <div className="flex gap-4">
          <Radio
            name="isReservation"
            label="가능"
            value="Y"
            checked={form.isReservation === "Y"}
            onChange={() => handleChange("isReservation", "Y")}
          />
          <Radio
            name="isReservation"
            label="불가"
            value="N"
            checked={form.isReservation === "N"}
            onChange={() => handleChange("isReservation", "N")}
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleSubmit}>등록</Button>
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() => navigate("/admin/list")}
        >
          목록
        </Button>
      </div>
    </div>
  );
}
