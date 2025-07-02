import React, { useState, useEffect } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Radio from "@/components/common/Radio";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";
import Select from "@/components/common/Select";
import useModal from "@/hooks/useModal";

export default function AdminRegist() {
  const [form, setForm] = useState({
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
  const [companyOptions, setCompanyOptions] = useState([]);
  const [companyError, setCompanyError] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    username: "",
    phone: false,
    email: "",
    company: false,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/api/v1/user/company");
        if (res.data?.success) {
          const seen = new Set();
          const unique = res.data.data.filter((item) => {
            if (seen.has(item.companyId)) return false;
            seen.add(item.companyId);
            return true;
          });
          setCompanyOptions(unique);
        }
      } catch (error) {
        console.error("입주사 목록 불러오기 실패:", error);
      }
    };

    fetchCompanies();
  }, []);

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
      if (value.length > 10) {
        setErrors((prev) => ({
          ...prev,
          name: "이름은 최대 10자까지 입력 가능합니다.",
        }));
        return; // 입력 제한
      } else {
        setErrors((prev) => ({ ...prev, name: "" }));
      }
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

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const newErrors = {
      name: !form.name,
      username: !form.username,
      phone: !form.phone,
      email: !form.email,
      company: !form.company,
    };

    const usernameRegex = /^[a-zA-Z0-9]+$/; // 한글/특수문자 금지
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 검사

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) {
      showModal({
        title: "필수 항목 누락",
        message: "모든 필수 항목을 입력해주세요.",
        showCancel: false,
      });
      return;
    }
    if (!usernameRegex.test(form.username)) {
      showModal({
        title: "아이디 오류",
        message: "아이디는 4~16자의 영소문자와 숫자만 사용 가능합니다.",
        showCancel: false,
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      showModal({
        title: "비밀번호 확인",
        message: "비밀번호가 일치하지 않습니다.",
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

    if (!emailRegex.test(form.email)) {
      showModal({
        title: "이메일 오류",
        message: "올바른 이메일 형식을 입력해주세요.",
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

      role: "MEMBER", // 고정
      companyId: form.company,
      isAdmin: "N", // 고정
      isUse: form.status === "active" ? "Y" : "N",
      isManager: "N", // 고정
    };

    showModal({
      title: "등록 확인",
      message: "입력한 정보로 등록하시겠습니까?",
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.post("/api/v1/user/member/insert", payload);
          showModal({
            title: "등록 완료",
            message: "계정이 성공적으로 등록되었습니다.",
            showCancel: false,
            onConfirm: () => navigate("/user"),
          });
        } catch (error) {
          const message = error?.response?.data?.message || "";

          if (
            message.includes("Duplicate entry") &&
            message.includes("UQ_username")
          ) {
            showModal({
              title: "중복 아이디",
              message:
                "이미 존재하는 아이디입니다. 다른 아이디를 입력해주세요.",
              showCancel: false,
            });
          } else {
            showModal({
              title: "등록 실패",
              message: "등록에 실패했습니다. 관리자에게 문의하세요.",
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
          <Select
            label="입주사"
            value={form.company}
            onChange={(e) => {
              handleChange("company", Number(e.target.value));
              if (e.target.value) setCompanyError(false); // 값 선택 시 에러 해제
            }}
            className="w-[735px]"
            required
          >
            <option value="">선택하세요</option>
            {companyOptions.map((item) => (
              <option key={item.companyId} value={item.companyId}>
                {item.companyName}
              </option>
            ))}
          </Select>
          {companyError && (
            <p className="mt-1 text-sm text-red-500">입주사를 선택해주세요.</p>
          )}
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
        <div>
          {" "}
          <Input
            label="이름"
            value={form.name}
            onChange={(e) => {
              handleChange("name", e.target.value);
              if (e.target.value)
                setErrors((prev) => ({ ...prev, name: false }));
            }}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">이름을 입력해주세요.</p>
          )}
        </div>

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
          onChange={(e) => {
            handleChange("username", e.target.value);
          }}
          required
          error={errors.name}
          placeholder="4~16자 내의 영소문자,숫자로 구성"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-500">
            영소문자와 숫자만 입력할 수 있습니다 (4~16자).
          </p>
        )}
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
                onChange={(e) => {
                  handleChange("phone", e.target.value);
                  if (e.target.value)
                    setErrors((prev) => ({ ...prev, phone: false }));
                }}
                className="rounded-l-none"
                placeholder="1234-5678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  전화번호를 입력해주세요.
                </p>
              )}
            </div>
          </div>
        </div>
        <div>
          <Input
            label="이메일"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          {/* {errors.email && (
            // <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )} */}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleSubmit}>등록</Button>
        <Button
          className="bg-black-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message:
                "목록으로 돌아가면 입력한 정보가 사라집니다. 이동하시겠습니까?",
              showCancel: true,
              onConfirm: () => navigate("/user"),
            })
          }
        >
          목록
        </Button>
      </div>
    </div>
  );
}
