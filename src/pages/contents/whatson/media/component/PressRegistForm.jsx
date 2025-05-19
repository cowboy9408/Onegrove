import { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import Upload from "@/components/common/Upload";
import Radio from "@/components/common/Radio";
import Editor from "@/components/common/Editor";
import DateRangePicker from "@/components/common/Datepicker";

const PressRegistForm = forwardRef(({ data, setData, lang }, ref) => {
  const methods = useForm();

  const { register, handleSubmit, setValue, getValues, watch } = methods;

  const [dateRange, setDateRange] = useState({
    startDate: data?.startDate ? new Date(data.startDate) : null,
    endDate: data?.endDate ? new Date(data.endDate) : null,
  });

  const editorRef = useState(null);

  useEffect(() => {
    setValue("startDate", dateRange.startDate);
  }, [dateRange]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const isValid = await methods.trigger();
      if (!isValid) return null;

      const editorHtml = await editorRef.current?.getContent();

      return {
        ...getValues(),
        content1: editorHtml,
      };
    },
  }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(() => {})} className="space-y-6 p-6"></form>
      <div className="space-y-6">
        {/* 카테고리 */}
        <Select
          id="category"
          label="카테고리"
          value={watch("category")}
          onChange={(e) => setValue("category", e.target.value)}
          required
        >
          <option value="ep0101">카테고리 A</option>
          <option value="ep0102">카테고리 B</option>
          {/* 필요 시 추가 */}
        </Select>

        {/* 제목 */}
        <Input
          id="title"
          label="제목"
          {...register("title", { required: true })}
        />

        {/* 업로드 1 */}
        <Upload name="imgPc" label="PC 썸네일 이미지" required />

        {/* 업로드 2 */}
        <Upload name="imgMo" label="모바일 썸네일 이미지" required />

        {/* 노출 여부 */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">노출 여부</p>
          <div className="flex gap-4">
            <Radio
              name="status"
              value="active"
              label="노출"
              checked={watch("status") === "active"}
              onChange={() => setValue("status", "active")}
            />
            <Radio
              name="status"
              value="inactive"
              label="비노출"
              checked={watch("status") === "inactive"}
              onChange={() => setValue("status", "inactive")}
            />
          </div>
        </div>

        {/* 에디터 */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">내용</p>
          <Editor ref={editorRef} initialContent={data?.content1 || ""} />
        </div>

        {/* 발행일 */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">발행일</p>
          <DateRangePicker
            startDate={dateRange.startDate}
            onChange={setDateRange}
          />
        </div>
      </div>
    </FormProvider>
  );
});

export default PressRegistForm;
