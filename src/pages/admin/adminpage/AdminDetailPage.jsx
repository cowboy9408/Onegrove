import React, { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Button from "@/components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function AdminDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [isLocked, setIsLocked] = useState(false);

  const [form, setForm] = useState({
    role: "NORMAL_ADMIN",
    status: "active",
    name: "",
    gender: "",
    username: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/v1/user/admin/${id}`);
        console.log("조회 응답:", res.data);
        if (res.data.success && res.data.data) {
          const data = res.data.data;
          setForm({
            role: data.role,
            status: data.isUse === "Y" ? "active" : "inactive",
            name: data.name || "",
            gender: mapGender(data.gender),
            username: data.username || "",
            phone: data.phoneNumber?.startsWith("010-")
              ? data.phoneNumber.split("-").slice(1).join("-")
              : data.phoneNumber || "",
            email: data.email || "",
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
    if (!form.name || !form.username || !form.phone || !form.email) {
      showModal({
        title: "필수 항목 누락",
        message: "모든 필수 항목을 입력해주세요.",
        showCancel: false,
      });
      return;
    }

    try {
      const payload = {
        id: Number(id),
        // companyId: 4,
        role: form.role,
        name: form.name,
        phoneNumber: formatPhoneNumber(form.phone),
        email: form.email,
        gender:
          form.gender === "male" ? "M" : form.gender === "female" ? "W" : "",
        isUse: form.status === "active" ? "Y" : "N",
        isManager: "N",
        isReservation: "Y",
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
                onConfirm: () => navigate("/admin/list"),
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
      // 이 catch는 필요 없어졌지만 남겨도 무방
      console.error("수정 로직 실패:", error);
    }
  };

  return (
    <>
      <div className="max-w mx-auto space-y-6 rounded-lg bg-white p-6 shadow-md">
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
                label="리테일"
                value="RETAIL_ADMIN"
                checked={form.role === "RETAIL_ADMIN"}
                onChange={() => handleChange("role", "RETAIL_ADMIN")}
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
          onClick={() => {
            alert("임시 비밀번호가 발급되었습니다.");
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
              onConfirm: () => navigate("/admin/list"),
            })
          }
        >
          목록
        </Button>
      </div>
    </>
  );
}
