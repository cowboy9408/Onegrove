import {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
  useRef,
} from "react";
import { useForm, FormProvider } from "react-hook-form";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import Upload from "@/components/common/Upload";
import Radio from "@/components/common/Radio";
import Editor from "@/components/common/Editor";
import Datepicker from "@/components/common/Datepicker";
import api from "@/lib/apiClient";

const PressRegistForm = forwardRef(({ data, setData, lang }, ref) => {
  const methods = useForm({
    defaultValues: {
      status: "active",
    },
  });
  const [singleDate, setSingleDate] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const { register, handleSubmit, setValue, getValues, watch } = methods;

  const editorRef = useRef(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get("/api/v1/press/category");
        setCategoryList(res.data?.data || []);
      } catch (err) {
        console.error("카테고리 목록 불러오기 실패:", err);
      }
    };

    fetchCategory();
  }, []);
  useEffect(() => {
    register("publish_date", { required: true });
  }, [register]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const isValid = await methods.trigger();
      if (!isValid) return null;

      const values = getValues();
      const content = await editorRef.current?.getContent();

      if (!values.publish_date) {
        alert("발행일을 선택해주세요.");
        return null;
      }

      const toImageMeta = (file) => {
        return {
          path: file?.path || "",
          classification: "press&media",
        };
      };

      return {
        category: values.category,
        title: values.title,
        thumbImgPc: toImageMeta(values.imgPc),
        thumbImgMo: toImageMeta(values.imgMo),
        showYn: values.status === "active" ? "Y" : "N",
        content: content,
        publish_date: values.publish_date,
      };
    },
  }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(() => {})} className="space-y-6 p-6">
        <div className="space-y-6">
          {/* 카테고리 */}
          <Select
            id="category"
            label="카테고리"
            value={watch("category")}
            onChange={(e) => setValue("category", e.target.value)}
            required
          >
            <option value="">카테고리 선택</option>
            {categoryList.map((item) => (
              <option key={item.code} value={item.code}>
                {item.value}
              </option>
            ))}
          </Select>

          {/* 제목 */}
          <Input
            id="title"
            label="제목"
            {...register("title", { required: true })}
          />

          {/* 업로드 1 */}
          <Upload
            name="imgPc"
            label="PC 썸네일 이미지"
            required
            classification="press&media"
          />

          {/* 업로드 2 */}
          <Upload
            name="imgMo"
            label="모바일 썸네일 이미지"
            required
            classification="press&media"
          />

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
            <Datepicker
              mode="single"
              selectedDate={singleDate}
              onSingleChange={(date) => {
                setSingleDate(date);
                const isoDate = date.toISOString().split("T")[0];
                setValue("publish_date", isoDate);
              }}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
});

export default PressRegistForm;
