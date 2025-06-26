import { useState, useImperativeHandle, forwardRef } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Select from "@/components/common/Select";
import Datepicker from "@/components/common/Datepicker";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import { useForm, FormProvider } from "react-hook-form";

export default function PopupRegist() {
  const methods = useForm();

  const [form, setForm] = useState({
    title: "",
    isVisible: "Y",
    menu: "",
    language: "ko",
    period: { startDate: null, endDate: null },
    image: null,
    url: "",
    buttonLabel: "",
    buttonTextColor: "",
    buttonBgColor: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("저장 데이터:", form);
    alert("팝업이 등록되었습니다!");
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-4xl space-y-6 rounded-lg bg-white p-6 shadow-md">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          <div className="flex items-start gap-6">
            {/* 타이틀 */}
            <div className="flex-1">
              <Input
                label="타이틀"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            {/* 노출 여부 */}
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium">노출 여부</p>
              <div className="flex gap-4">
                <Radio
                  name="isVisible"
                  value="Y"
                  checked={form.isVisible === "Y"}
                  onChange={(e) => handleChange("isVisible", e.target.value)}
                  label="노출"
                />
                <Radio
                  name="isVisible"
                  value="N"
                  checked={form.isVisible === "N"}
                  onChange={(e) => handleChange("isVisible", e.target.value)}
                  label="미노출"
                />
              </div>
            </div>
          </div>

          {/* 메뉴 선택 */}
          <div className="flex items-start gap-6">
            {/* 메뉴 */}
            <div className="flex-1">
              <Select
                label="메뉴 선택"
                value={form.menu}
                onChange={(e) => handleChange("menu", e.target.value)}
                required
              >
                <option value="">선택</option>
                <option value="home">홈</option>
                <option value="event">이벤트</option>
                <option value="notice">공지사항</option>
              </Select>
            </div>

            {/* 언어 */}
          </div>

          {/* 노출 기간 */}
          <div>
            <p className="mb-2 text-sm font-medium">
              노출 기간<span className="ml-1 text-red-500">*</span>
            </p>
            <Datepicker
              startDate={form.period.startDate}
              endDate={form.period.endDate}
              onChange={(val) => handleChange("period", val)}
            />
          </div>

          {/* 팝업 이미지 업로드 */}
          <Upload
            name="ImgPc"
            label="팝업 이미지 업로드"
            required
            defaultValue={form.image}
            onChange={(val) => handleChange("image", val)}
          />
          <Upload
            name="ImgMo"
            label="팝업 이미지 업로드"
            required
            defaultValue={form.image}
            onChange={(val) => handleChange("image", val)}
          />

          {/* URL, 버튼 텍스트, 색상 */}
          <Input
            label="랜딩 URL"
            value={form.url}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://example.com"
            required
          />

          {/* 하단 버튼 */}
        </div>
      </div>
    </FormProvider>
  );
}
