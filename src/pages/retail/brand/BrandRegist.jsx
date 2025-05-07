import React, { useState, useRef } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import Checkbox from "@/components/common/Checkbox";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import Editor from "@/components/common/Editor";
import NewInput from "@/components/common/NewInput";

export default function BrandRegist() {
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
    homepageUrl: "",
    homepageNewWindow: false,
    sns: {
      instagram: { url: "", newWindow: false },
      facebook: { url: "", newWindow: false },
      youtube: { url: "", newWindow: false },
      twitter: { url: "", newWindow: false },
    },
    openingHours: {
      mon: { time: "", holiday: false },
      tue: { time: "", holiday: false },
      wed: { time: "", holiday: false },
      thu: { time: "", holiday: false },
      fri: { time: "", holiday: false },
      sat: { time: "", holiday: false },
      sun: { time: "", holiday: false },
      breakTime: { time: "", none: false },
    },
    storePhone: "",
    storeLocation: "",
  });

  const methods = useForm();
  const navigate = useNavigate();
  const editorRef = useRef();

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSubmit = () => {
    console.log("등록 요청 데이터:", form);
    // TODO: 서버로 전송 처리
  };

  return (
    <FormProvider {...methods}>
      
      <div className="mx-auto max-w-3xl space-y-6 rounded-lg bg-white p-6 shadow-md">
      {/* 입주사명 + 사용 여부 */}
      <div className="flex flex-wrap gap-8">
        <div className="flex-1 min-w-[250px]">
          <Input
            label="브랜드명"
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
        <div className="flex-1 min-w-[150px]">
          <Select
            label="카테고리"
            value={form.office}
            onChange={(e) => handleChange("office", e.target.value)}
            required
          >
            <option value="">선택</option>
            <option value="office1">카테고리1</option>
            <option value="office2">카테고리2</option>
            <option value="office2">카테고리3</option>
            <option value="office2">카테고리4</option>
        
          </Select>
        </div>

        <div className="flex-1 min-w-[250px]">
          
        </div>
      </div>

      <div>
        <Upload
          name="mainImage"
          label="썸네일 이미지"
          preview
        />
      </div>
      <div>
        <Input
          label="썸네일 텍스트"
          value={form.ceoName}
          onChange={(e) => handleChange("ceoName", e.target.value)}
          required
        />
      </div>

      {/* 입주사 전화번호 */}
      <div>
        <Input
          label="대타이틀"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          label="서브타이틀"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          required
        />
      </div>

      
      <div className="space-y-4">
                <Upload name="thumbnail" label="PC 본문 이미지" />
                <Upload name="thumbnail" label="MO 본문 이미지" />
              </div>

              <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
  메인 내용
</p>
   <Editor ref={editorRef} />

   <div className="space-y-4">
                <Upload name="thumbnail" label="본문 이미지 1" />
                <Upload name="thumbnail" label="본문 이미지 2" />
                <Upload name="thumbnail" label="본문 이미지 3" />
                <Upload name="thumbnail" label="본문 이미지 4" />
                <Upload name="thumbnail" label="본문 이미지 5" />
                
              </div>

   <div className="space-y-4">
                <Upload name="thumbnail" label="PC 본문 이미지" />
                <Upload name="thumbnail" label="MO 본문 이미지" />
              </div>


        {/* 추가 콘텐츠 시작 */}
        <div className="space-y-6">
          
          <div className="flex items-center gap-4">
    <NewInput
      label="홈페이지 URL"
      value={form.homepageUrl}
      onChange={(e) => handleChange("homepageUrl", e.target.value)}
      width="w-[550px]"
      required
    />
    <Checkbox
    label={<span className="whitespace-nowrap">새 창</span>}
    checked={form.homepageNewTab}
    onChange={(e) => handleChange("homepageNewTab", e.target.checked)}
  />
  </div>

<p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
  SNS URL
</p>
         {/* SNS URL */}
         <div className="space-y-3"> {/* 여기서 수직 간격 조절 */}
  {["instagram", "facebook", "youtube", "x(twitter)"].map((platform) => (
    <div key={platform} className="flex items-center gap-4">
      <NewInput
        label={`${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
        value={form[`${platform}Url`]}
        onChange={(e) => handleChange(`${platform}Url`, e.target.value)}
        width="w-[500px]"
      />
      <Checkbox
        label={<span className="whitespace-nowrap">새 창</span>}
        checked={form.homepageNewTab}
        onChange={(e) => handleChange("homepageNewTab", e.target.checked)}
      />
    </div>
  ))}
</div>

  <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
  운영시간<span className="text-red-500 ml-0.5">*</span>
</p>

         {/* 운영시간 */}
  <div className="space-y-4 w-fit ml-25">
    {["월", "화", "수", "목", "금", "토", "일"].map((day, index) => (
      <div key={day} className="flex items-center gap-6">
        <NewInput
          label={`${day}`}
          value={form[`operatingTime${index}`]}
          onChange={(e) => handleChange(`operatingTime${index}`, e.target.value)}
          height="h-6"
  width="w-[280px]"
        />
         <div className="inline-flex items-center">
    <Checkbox
      label={<span className="whitespace-nowrap">휴일</span>}
      checked={form.homepageNewTab}
      onChange={(e) => handleChange("homepageNewTab", e.target.checked)}
    />
  </div>
      </div>
    ))}

    {/* 휴식시간 */}
    <div className="flex items-center gap-6">
      <NewInput
        label="휴식시간"
        value={form.breakTime}
        onChange={(e) => handleChange("breakTime", e.target.value)}
        height="h-6"
  width="w-[280px]"
      />
      <Checkbox
    label={<span className="whitespace-nowrap">없음</span>}
    checked={form.homepageNewTab}
    onChange={(e) => handleChange("homepageNewTab", e.target.checked)}
  />
    </div>
  </div>

          {/* 매장 전화번호 */}
          <div>
            <Input
              label="매장 전화번호"
              value={form.storePhone}
              onChange={(e) => handleChange("storePhone", e.target.value)}
              
            />
          </div>

          {/* 매장 위치 */}
          <div>
            <Input
              label="매장 위치"
              value={form.storeLocation}
              onChange={(e) => handleChange("storeLocation", e.target.value)}
              required
            />
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
