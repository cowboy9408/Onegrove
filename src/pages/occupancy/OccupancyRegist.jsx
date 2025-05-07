import React, { useState } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

export default function OccupancyRegist() {
  const [form, setForm] = useState({
    companyName: "",
    useStatus: "active",
    office: "",
    floor: "",
    ceoName: "",
    phone: "",
    mainImage: null,
    roomUse: "yes",
    visitorAllow: "yes",
  });

  const methods = useForm(); // react-hook-form 초기화
  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("등록 요청 데이터:", form);
    // TODO: 서버로 전송 처리
  };

  return (
    <FormProvider {...methods}>
    <div className="mx-auto max-w-3xl space-y-6 rounded-lg bg-white p-8 shadow-md">
      {/* 입주사명 + 사용 여부 */}
      <div className="flex flex-wrap gap-8">
        <div className="flex-1 min-w-[250px]">
          <Input
            label="입주사명"
            value={form.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            required
          />
        </div>

        <div className="flex-1 min-w-[250px]">
          <p className="mb-2 text-sm font-medium text-gray-800">사용 여부</p>
          <div className="flex gap-4">
            <Radio
              name="useStatus"
              label="사용"
              value="active"
              checked={form.useStatus === "active"}
              onChange={() => handleChange("useStatus", "active")}
            />
            <Radio
              name="useStatus"
              label="미사용"
              value="inactive"
              checked={form.useStatus === "inactive"}
              onChange={() => handleChange("useStatus", "inactive")}
            />
          </div>
        </div>
      </div>

      {/* 오피스 선택 + 층 수 선택 */}
      <div className="flex flex-wrap gap-8">
        <div className="flex-1 min-w-[250px]">
          <Select
            label="오피스 선택"
            value={form.office}
            onChange={(e) => handleChange("office", e.target.value)}
            required
          >
            <option value="">선택</option>
            <option value="office1">오피스1</option>
            <option value="office2">오피스2</option>
          </Select>
        </div>

        <div className="flex-1 min-w-[250px]">
          <Select
            label="층 수 선택"
            value={form.floor}
            onChange={(e) => handleChange("floor", e.target.value)}
            required
          >
            <option value="">선택</option>
            <option value="1F">1층</option>
            <option value="2F">2층</option>
            <option value="3F">3층</option>
          </Select>
        </div>
      </div>

      {/* 대표명 */}
      <div>
        <Input
          label="대표명"
          value={form.ceoName}
          onChange={(e) => handleChange("ceoName", e.target.value)}
          required
        />
      </div>

      {/* 입주사 전화번호 */}
      <div>
        <Input
          label="입주사 전화번호"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          required
        />
      </div>

      {/* 대표 이미지 업로드 */}
      <div>
        <Upload
          name="mainImage"
          label="대표 이미지 업로드"
          preview
        />
      </div>

      {/* 회실 사용 여부 + 방문자 등록 여부 */}
      <div className="flex flex-wrap gap-8">
        <div className="flex-1 min-w-[250px]">
          <p className="mb-2 text-sm font-medium text-gray-800">회의실 사용 여부</p>
          <div className="flex gap-4">
            <Radio
              name="roomUse"
              label="사용"
              value="yes"
              checked={form.roomUse === "yes"}
              onChange={() => handleChange("roomUse", "yes")}
            />
            <Radio
              name="roomUse"
              label="미사용"
              value="no"
              checked={form.roomUse === "no"}
              onChange={() => handleChange("roomUse", "no")}
            />
          </div>
        </div>

        <div className="flex-1 min-w-[250px]">
          <p className="mb-2 text-sm font-medium text-gray-800">방문자 등록 가능 여부</p>
          <div className="flex gap-4">
            <Radio
              name="visitorAllow"
              label="가능"
              value="yes"
              checked={form.visitorAllow === "yes"}
              onChange={() => handleChange("visitorAllow", "yes")}
            />
            <Radio
              name="visitorAllow"
              label="불가능"
              value="no"
              checked={form.visitorAllow === "no"}
              onChange={() => handleChange("visitorAllow", "no")}
            />
          </div>
        </div>
      </div>

      {/* 등록 / 목록 버튼 */}
      <div className="flex justify-end gap-4 pt-6">
        <Button onClick={handleSubmit}>등록</Button>
        <Button
          type="button"
          className="bg-gray-200 text-black"
          onClick={() => navigate("/occupancy")}
        >
          목록
        </Button>
      </div>
    </div>
    </FormProvider>
  );
}
