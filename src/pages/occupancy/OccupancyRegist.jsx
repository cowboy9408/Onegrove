import React, { useState } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import OfficeFloorForm from "@/components/common/OfficeFloorForm";

export default function OccupancyRegist() {
  const [form, setForm] = useState({
    companyName: "",
    useStatus: "active",
    locations: [{ office: "", floor: "" }],
    ceoName: "",
    phone: "",
    mail: "",
    mainImage: null,
    roomUse: "yes",
    visitorAllow: "yes",
  });

  const methods = useForm();
  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
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
          <div className="min-w-[250px] flex-1">
            <Input
              label="입주사명"
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              required
            />
          </div>

          <div className="min-w-[250px] flex-1">
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
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold">오피스 설정</h2>

          <OfficeFloorForm
            value={form.locations}
            onChange={(newVal) => handleChange("locations", newVal)}
          />
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
        <div>
          <Input
            label="대표 이메일"
            value={form.mail}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
        </div>

        {/* 대표 이미지 업로드 */}
        <div>
          <Upload name="mainImage" label="대표 이미지 업로드" preview />
        </div>
        <div className="w-[400px]">
          <Input
            label="회의실 예약 무료 시간"
            value={form.time}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
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
