import React, { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Button from "@/components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/apiClient";
import Select from "@/components/common/Select";
import useModal from "@/hooks/useModal";

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showModal } = useModal();

  const [form, setForm] = useState({
    role: "admin",
    status: "active",
    name: "",
    gender: "",
    username: "",
    phone: "",
    email: "",
  });
  const [companyOptions, setCompanyOptions] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
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
          setCompanyOptions(res.data.data);
        }
      } catch (err) {
        console.error("입주사 목록 로딩 실패:", err);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/v1/user/member/${id}`);
        console.log("조회 응답:", res.data);
        if (res.data.success && res.data.data) {
          const data = res.data.data;
          setForm({
            role: data.role,
            status: data.isUse === "Y" ? "active" : "inactive",
            name: data.name || "",
            company: data.companyId ?? "",
            gender: mapGender(data.gender),
            username: data.username || "",
            phone: data.phoneNumber?.startsWith("010-")
              ? data.phoneNumber.split("-").slice(1).join("-")
              : data.phoneNumber || "",
            email: data.email || "",
            isReservation: data.isReservation === "Y" ? "Y" : "N",
          });
          setIsLocked(data.isLock === "Y");
        }
      } catch (err) {
        console.error("상세 정보 조회 실패:", err);
      }
    };

    fetchData();
  }, [id]);

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

    if (key === "phone") {
      // 숫자만 허용
      const numeric = value.replace(/\D/g, "");
      if (numeric.length > 8) return; // 8자 초과 방지
      setForm((prev) => ({ ...prev, phone: numeric }));
      setErrors((prev) => ({ ...prev, phone: false }));
      return;
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // const mapRoleToForm = (role) => {
  //   switch (role.toUpperCase()) {
  //     case "NORMAL_ADMIN":
  //     case "ADMIN":
  //       return "admin";
  //     case "RETAIL_ADMIN":
  //     case "RETAIL":
  //       return "retail";
  //     case "OFFICE_ADMIN":
  //     case "MANAGER":
  //       return "manager";
  //     default:
  //       return "admin";
  //   }
  // };

  const mapGender = (gender) => {
    switch (gender) {
      case "M":
        return "male";
      case "W":
        return "female";
      default:
        return "";
    }
  };

  const formatPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, ""); // 숫자만 추출

    if (digits.length === 8) {
      return `010-${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else if (digits.length === 7) {
      return `010-${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `010-${phone.replace(/[^0-9]/g, "")}`;
    }
  };

  const handleUpdate = async () => {
    if (
      !form.name ||
      !form.username ||
      !form.phone ||
      !form.email ||
      !form.company
    ) {
      showModal({
        title: "필수 항목 누락",
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

    const payload = {
      id: Number(id),
      companyId: form.company,
      role: form.role,
      name: form.name,
      phoneNumber: formatPhoneNumber(form.phone),

      email: form.email,
      gender:
        form.gender === "male" ? "M" : form.gender === "female" ? "W" : "",
      isUse: form.status === "active" ? "Y" : "N",
      isManager: "N",
      isReservation: "N",
    };

    showModal({
      title: "수정 확인",
      message: "입력한 정보로 수정하시겠습니까?",
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await api.post("/api/v1/user/member/update", payload);
          if (res.data.success) {
            showModal({
              title: "수정 완료",
              message: "수정이 완료되었습니다.",
              showCancel: false,
              onConfirm: () => navigate("/user"),
            });
          } else {
            showModal({
              title: "수정 실패",
              message: res.data.message || "수정에 실패했습니다.",
              showCancel: false,
            });
          }
        } catch (error) {
          console.error("수정 요청 실패:", error);
          showModal({
            title: "서버 오류",
            message: "서버 오류로 수정에 실패했습니다.",
            showCancel: false,
          });
        }
      },
    });
  };

  return (
    <>
      <div className="absolute top-14 -mt-3 w-full text-2xl font-bold">
        임직원 상세 정보
      </div>
      <div className="max-w mx-auto space-y-6 rounded-lg bg-white p-6 shadow-md">
        <div className="flex flex-wrap gap-8">
          <div>
            <Select
              label="입주사"
              value={form.company}
              re
              onChange={(e) => handleChange("company", Number(e.target.value))}
              className="w-full max-w-[735px]"
              required
            >
              <option value="">선택하세요</option>
              {companyOptions.map((item) => (
                <option key={item.companyId} value={item.companyId}>
                  {item.companyName}
                </option>
              ))}
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
          <div className="mt-6 text-sm font-semibold text-gray-700">
            계정 상태:{" "}
            <span className={isLocked ? "text-red-600" : "text-black-600"}>
              {isLocked ? "잠금" : "활성화"}
            </span>
          </div>
        </div>

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
            disabled
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
      </div>
      <div className="flex justify-end gap-3 px-6 pt-5 pb-6">
        {isLocked && (
          <Button
            className="bg-black-100"
            onClick={async () => {
              try {
                const payload = {
                  id: Number(id),
                  username: form.username,
                  email: form.email,
                  role: form.role,
                };

                const res = await api.post("/api/v1/user/unlock", payload);

                if (res.data.success) {
                  showModal({
                    title: "계정 잠금 해제 완료",
                    message:
                      "계정이 해제되었으며, 이메일로 임시 비밀번호가 발송되었습니다.",
                    showCancel: false,
                    onConfirm: () => {
                      // 해제 후 UI에서도 버튼 안보이게 처리
                      setIsLocked(false);
                    },
                  });
                } else {
                  showModal({
                    title: "잠금 해제 실패",
                    message: res.data.message || "잠금 해제에 실패했습니다.",
                    showCancel: false,
                  });
                }
              } catch (error) {
                console.error("잠금 해제 실패:", error);
                showModal({
                  title: "서버 오류",
                  message: "서버 오류로 잠금 해제에 실패했습니다.",
                  showCancel: false,
                });
              }
            }}
          >
            계정 잠금(휴면) 해제
          </Button>
        )}

        <Button
          className="bg-black-100"
          onClick={async () => {
            if (!form.email || !form.email.includes("@")) {
              showModal({
                title: "이메일 오류",
                message: "올바른 이메일을 입력해주세요.",
                showCancel: false,
              });
              return;
            }

            try {
              const payload = {
                id: Number(id),
                username: form.username,
                email: form.email,
                role: form.role,
              };

              console.log("payload", payload); // 요청값 확인용

              const res = await api.post("/api/v1/user/temp-password", payload);

              if (res.data.success) {
                showModal({
                  title: "발급 완료",
                  message: "임시 비밀번호가 이메일로 전송되었습니다.",
                  showCancel: false,
                });
              } else {
                showModal({
                  title: "발급 실패",
                  message:
                    res.data.message || "임시 비밀번호 발급에 실패했습니다.",
                  showCancel: false,
                });
              }
            } catch (error) {
              console.error("임시 비밀번호 발급 실패:", error);

              const errorMessage =
                error?.response?.data?.message ||
                "서버 오류로 인해 발급에 실패했습니다.";

              showModal({
                title: "오류",
                message: "등록된 이메일을 찾을수 없습니다.",
                showCancel: false,
              });
            }
          }}
        >
          임시 비밀번호 발급
        </Button>

        <Button
          className="bg-black-600 text-white hover:bg-gray-700"
          onClick={handleUpdate}
        >
          수정
        </Button>

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
    </>
  );
}
