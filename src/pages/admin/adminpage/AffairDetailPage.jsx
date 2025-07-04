import React, { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Button from "@/components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";
import Select from "@/components/common/Select";

export default function AffairDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [companies, setCompanies] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  const [form, setForm] = useState({
    role: "OFFICE_SECRETARY_ADMIN",
    status: "active",
    name: "",
    gender: "",
    username: "",
    phone: "",
    email: "",
    isManager: "",
    isReservation: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    username: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/v1/user/admin/${id}`);

        if (res.data.success && res.data.data) {
          const data = res.data.data;
          setForm({
            companyId: data.companyId ?? "",
            role: data.role,
            status: data.isUse === "Y" ? "active" : "inactive",
            name: data.name || "",
            gender: mapGender(data.gender),
            username: data.username || "",
            phone: data.phoneNumber?.startsWith("010-")
              ? data.phoneNumber.split("-").slice(1).join("-")
              : data.phoneNumber || "",
            email: data.email || "",
            isManager: data.isManager === "Y" ? "Y" : "N", // 무조건 Y/N으로 변환

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

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/api/v1/user/company");
        const rawData = response?.data?.data || [];

        // 중복 companyId 제거
        const uniqueCompanies = [];
        const seen = new Set();

        for (const c of rawData) {
          if (!seen.has(c.companyId)) {
            uniqueCompanies.push(c);
            seen.add(c.companyId);
          }
        }

        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error("입주사 목록 조회 실패:", error);
      }
    };

    fetchCompanies();
  }, []);

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
      const numeric = value.replace(/\D/g, "");
      if (numeric.length > 8) return; // 8자리 초과 방지
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigitsOnly = form.phone.replace(/\D/g, "");
    if (!form.name || !form.username || !form.phone || !form.email) {
      showModal({
        title: "필수 항목 확인",
        message: "모든 필수 항목을 입력해주세요.",
        showCancel: false,
      });
      return;
    }

    if (!form.companyId) {
      showModal({
        title: "필수 입력",
        message: "모든 필수 항목을 입력해주세요.",
        showCancel: false,
      });
      return;
    }

    if (form.name.length > 10) {
      showModal({
        title: "이름 오류",
        message: "이름은 최대 10자까지 입력 가능합니다.",
        showCancel: false,
      });
      return;
    }

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
        message: "올바른 이메일 형식이 아닙니다.",
        showCancel: false,
      });
      return;
    }

    try {
      const payload = {
        id: Number(id),
        companyId: form.companyId,
        role: form.role,
        name: form.name,
        phoneNumber: formatPhoneNumber(form.phone),
        email: form.email,
        gender:
          form.gender === "male" ? "M" : form.gender === "female" ? "W" : "",
        isUse: form.status === "active" ? "Y" : "N",
        isManager: form.isManager,
        isReservation: form.isReservation,
      };

      showModal({
        title: "수정 확인",
        message: "입력하신 정보로 수정을 진행하시겠습니까?",
        showCancel: true,
        onConfirm: async () => {
          try {
            const res = await api.post("/api/v1/user/admin/update", payload);
            if (res.data.success) {
              showModal({
                title: "수정 완료",
                message: "수정이 완료되었습니다.",
                showCancel: false,
                onConfirm: () => navigate("/admin/affair"),
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
    } catch (error) {
      console.error("수정 로직 실패:", error);
    }
  };

  return (
    <>
      <div className="absolute top-14 -mt-3 w-full text-2xl font-bold">
        입주사 총무팀 상세 정보
      </div>
      <div className="max-w mx-auto space-y-6 rounded-lg bg-white p-6 shadow-md">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-800">계정 유형</p>
            <div className="flex gap-4">
              <Select
                label="입주사 선택"
                value={String(form.companyId || "")} // 반드시 문자열로 변환
                onChange={(e) =>
                  handleChange("companyId", Number(e.target.value))
                } // 저장은 숫자로
                required
              >
                <option value="">입주사를 선택하세요</option>
                {companies.map((company) => (
                  <option
                    key={company.companyId}
                    value={String(company.companyId)}
                  >
                    {company.companyName}
                  </option>
                ))}
              </Select>
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
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              전화번호
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
          />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-800">담당자 여부</p>
          <div className="flex gap-4">
            <Radio
              name="isManager"
              label="등록"
              value="Y"
              checked={form.isManager === "Y"}
              onChange={() => handleChange("isManager", "Y")}
            />
            <Radio
              name="isManager"
              label="미등록"
              value="N"
              checked={form.isManager === "N"}
              onChange={() => handleChange("isManager", "N")}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">
            어메니티 예약 기능
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
            try {
              const payload = {
                id: Number(id),
                username: form.username,
                email: form.email,
              };

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
              showModal({
                title: "서버 오류",
                message: "서버 오류로 인해 발급에 실패했습니다.",
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
                "목록으로 돌아가면 수정 사항이 저장되지 않습니다. 이동하시겠습니까?",
              showCancel: true,
              onConfirm: () => navigate("/admin/affair"),
            })
          }
        >
          목록
        </Button>
      </div>
    </>
  );
}
