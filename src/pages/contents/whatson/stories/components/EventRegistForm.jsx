import { useForm, FormProvider } from "react-hook-form";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import DateRangePicker from "@/components/common/Datepicker";
import Editor from "@/components/common/Editor";
import Button from "@/components/common/Button";
import Row from "@/components/layout/Row";
import Col from "@/components/layout/Col";
import BrandList from "@/components/modal/BrandList";
import useModal from "@/hooks/useModal";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 목록 이동용

export default function EventRegistForm() {
  const methods = useForm();
  const editorRef = useRef();
  const [brands, setBrands] = useState([]);
  const { showModal } = useModal();
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const navigate = useNavigate(); // ✅ 페이지 이동 훅

  const onSubmit = async (data) => {
    const content = await editorRef.current.getContent();
    console.log({
      ...data,
      brandIds: brands.map((e) => e._id),
      content,
      ...dateRange,
    });
  };

  return (
    <FormProvider {...methods}>
      <form
        id="event-regist-form" // ✅ form ID 추가
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-6 p-6"
      >
        {/* 카테고리 + 상태 */}
        <div className="flex justify-between items-end">
          <Select
            label="카테고리"
            {...methods.register("category")}
            required
            className="w-1/2"
          >
            <option value="">선택</option>
            <option value="promotion">프로모션</option>
            <option value="event">이벤트</option>
          </Select>
          <div className="flex items-center gap-4">
  <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
    노출 여부
  </p>
  <div className="flex gap-4">
    <Radio
      name="status"
      value="active"
      label="사용"
      checked={methods.watch("status") === "active"}
      onChange={() => methods.setValue("status", "active")}
    />
    <Radio
      name="status"
      value="inactive"
      label="미사용"
      checked={methods.watch("status") === "inactive"}
      onChange={() => methods.setValue("status", "inactive")}
    />
  </div>
</div>
        </div>

        <Input label="노출 순서" {...methods.register("order")} type="number" required />
        <Input label="타이틀" {...methods.register("title")} maxLength={50} required />

        <div className="space-y-4">
          <Upload name="thumbnail" label="썸네일 이미지" />
          <Upload name="banner" label="PC 본문 이미지" />
          <Upload name="extraImage" label="모바일 본문 이미지" />
        </div>

        <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
  상세 내용
</p>
   <Editor ref={editorRef} />

<p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
  이벤트 기간
</p>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
        />

        <Row className="pb-4">
          <Col className="flex-5">
            <Input
              label="노출 브랜드"
              readOnly
              required
              value={brands.map((e) => e.brand).join(", ")}
            />
            <input
              type="hidden"
              {...methods.register("lifestyle.brand")}
              value={brands.map((e) => e._id).join(",")}
            />
          </Col>
          <Col className="self-end">
            <Button
              className="h-12 w-full"
              onClick={() =>
                showModal({
                  title: "브랜드 선택",
                  children: ({ closeModal }) => (
                    <BrandList
                      selected={brands.map((e) => e._id)}
                      closeModal={closeModal}
                      onConfirm={(result) => {
                        setBrands(result);
                        methods.setValue("lifestyle.brand", result.map((e) => e._id));
                      }}
                    />
                  ),
                  showCancel: true,
                  customButton: true,
                  size: "5xl",
                })
              }
            >
              관리
            </Button>
          </Col>
        </Row>
      </form>

      
      <div className="flex justify-end gap-4 px-6 pb-6">
        
        <Button
          type="submit"
          form="event-regist-form"
          className="bg-black text-white"
        >
          저장
        </Button>
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() => navigate("/contents/whatson/event")}
        >
          목록
        </Button>
      </div>
    </FormProvider>
  );
}
