import { useState } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Select from "@/components/common/Select";
import Datepicker from "@/components/common/Datepicker";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function PopupRegist() {
  const methods = useForm();
  const navigate = useNavigate();
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
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium">언어</p>
              <div className="flex gap-4">
                <Radio
                  name="language"
                  value="ko"
                  checked={form.language === "ko"}
                  onChange={(e) => handleChange("language", e.target.value)}
                  label="한국어"
                />
                <Radio
                  name="language"
                  value="en"
                  checked={form.language === "en"}
                  onChange={(e) => handleChange("language", e.target.value)}
                  label="영어"
                />
              </div>
            </div>
          </div>

          {/* 노출 기간 */}
          <div>
            <p className="mb-2 text-sm font-medium">노출 기간</p>
            <Datepicker
              startDate={form.period.startDate}
              endDate={form.period.endDate}
              onChange={(val) => handleChange("period", val)}
            />
          </div>

          {/* 팝업 이미지 업로드 */}
          <Upload
            name="popupImage"
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
          />

          <Input
            label="버튼명"
            value={form.buttonLabel}
            onChange={(e) => handleChange("buttonLabel", e.target.value)}
            placeholder="예: 자세히 보기"
          />

          <div className="flex gap-6">
            <div className="flex-1">
              <Input
                label="버튼 글자색 (예: #ffffff)"
                value={form.buttonTextColor}
                onChange={(e) =>
                  handleChange("buttonTextColor", e.target.value)
                }
              />
            </div>
            <div className="flex-1">
              <Input
                label="버튼 배경색 (예: #000000)"
                value={form.buttonBgColor}
                onChange={(e) => handleChange("buttonBgColor", e.target.value)}
              />
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-4 px-6 pb-6">
            <Button onClick={handleSubmit}>등록</Button>
            <Button
              type="button"
              className="bg-gray-200"
              onClick={() => navigate("/popup")}
            >
              목록
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
