import React, { useState } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Radio from "@/components/common/Radio"; 
import { useNavigate } from "react-router-dom"; 

export default function UserRegist() {
  const [form, setForm] = useState({
    role: "admin",
    status: "active",
    company: "",
    name: "",
    id:"",
    password: "",
    phone: "",
    email: "",
  });
  const navigate = useNavigate(); 

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("등록 요청:", form);
    // 실제 등록 API 호출 로직 추가
  };

  return (

    <div className="mx-auto max-w rounded-lg bg-white p-6 shadow-md space-y-6">
      
      <Select
    label="입주사"
    value={form.company}
    onChange={(e) => handleChange("company", e.target.value)}
  >
    <option value="">선택하세요</option>
    <option value="LG">입주사1</option>
    <option value="삼성">입주사2</option>
    <option value="카카오">입주사3</option>
  </Select>
      <div className="flex flex-wrap gap-40">
  {/* 권한 */}
  <div className="w-full max-w-md">
  <Input
    label="이름"
    value={form.name}
    onChange={(e) => handleChange("name", e.target.value)}
    required
  />
</div>

  {/* 계정 상태 */}
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


      <div className="w-full max-w-ml mx-auto space-y-6">
  

  {/* 인풋 필드 */}
  <div className="w-[450px]">
  <Input
    label="아이디"
    value={form.id}
    onChange={(e) => handleChange("id", e.target.value)}
    required
  />
</div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    <Input
      label="이름"
      value={form.name}
      onChange={(e) => handleChange("name", e.target.value)}
      required
    />
    <Input
      label="비밀번호"
      type="password"
      value={form.password}
      onChange={(e) => handleChange("password", e.target.value)}
      required
    />
    <Input
      label="전화번호"
      value={form.phone}
      onChange={(e) => handleChange("phone", e.target.value)}
    />
    <Input
      label="이메일"
      value={form.email}
      onChange={(e) => handleChange("email", e.target.value)}
    />
  </div>
</div>

      {/* 버튼 */}
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleSubmit}>등록</Button>
        <Button
                  type="button"
                  className="bg-gray-200"
                  onClick={() => navigate("/contents/whatson/event")}
                >
                  목록
                </Button>
      </div>
    </div>
  );
}
