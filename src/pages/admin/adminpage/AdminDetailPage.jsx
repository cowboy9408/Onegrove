import React, { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Button from "@/components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/apiClient";

export default function AdminDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("현재 상세 페이지 ID:", id);

  const [form, setForm] = useState({
    role: "admin",
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
      case "F":
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
    console.log("폼 데이터:", form);
    try {
      const payload = {
        id: Number(id),
        companyId: 3,
        role: form.role,
        name: form.name,
        phoneNumber: formatPhoneNumber(form.phone),

        email: form.email,
        gender:
          form.gender === "male" ? "M" : form.gender === "female" ? "F" : "",
        isUse: form.status === "active" ? "Y" : "N",
      };

      const res = await api.post("/api/v1/user/admin/update", payload);
      if (res.data.success) {
        alert("수정이 완료되었습니다.");
        navigate("/admin/list");
      } else {
        alert("수정 실패: " + res.data.message);
      }
    } catch (error) {
      console.error("수정 요청 실패:", error);
      alert("서버 오류로 수정에 실패했습니다.");
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
                alert(
                  "계정 잠금이 해제되었고, 이메일로 아이디 및 임시 비밀번호가 전송되었습니다."
                );
              } else {
                alert("잠금 해제 실패: " + res.data.message);
              }
            } catch (error) {
              console.error("계정 잠금 해제 오류:", error);
              alert("서버 오류로 계정 잠금 해제에 실패했습니다.");
            }
          }}
        >
          계정 잠금(휴면) 해제
        </Button>

        <Button
          className="bg-black-100"
          onClick={() => {
            // TODO: 임시 비밀번호 발급 로직
            alert("임시 비밀번호 발급 요청");
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
          onClick={() => navigate("/admin/list")}
        >
          목록
        </Button>
      </div>
    </>
  );
}
