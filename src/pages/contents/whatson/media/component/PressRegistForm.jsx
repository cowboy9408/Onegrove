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

const PressRegistForm = forwardRef(({ data, lang, readOnly }, ref) => {
  const methods = useForm({ mode: "onChange" });
  const { register, setValue, getValues, watch } = methods;
  const [singleDate, setSingleDate] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const editorRef = useRef();

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
    console.log("받은 data:", data);
    if (data && Object.keys(data).length > 0) {
      setValue("category", data.categoryCode || "");
      setValue("title", data.title || "");
      setValue("status", data.showYn === "Y" ? "active" : "inactive");
      setValue("publish_date", data.publishDate || "");
      setValue("imgPc", data.thumbImgPc || null);
      setValue("imgMo", data.thumbImgMo || null);
      editorRef.current?.setContent?.(data.content || "");
      if (data.publishDate) {
        setSingleDate(new Date(data.publishDate));
      }
      console.log("값 세팅 완료");
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const values = getValues();
      const content = await editorRef.current?.getContent?.();

      const toImageMeta = (file) => {
        if (!file || !file.name) return null;

        return {
          id: null,
          originalName: file.originalName || file.name,
          name: file.name,
          size: file.size,
          extension: "." + (file.originalName || file.name).split(".").pop(),
          mime: file.type || "image/png",
          classification: "press&media",
          path: `C:\\upload\\test\\${file.name}`,
          status: null,
        };
      };

      if (!values.imgPc || !values.imgMo) {
        alert("PC, 모바일 썸네일 이미지를 모두 등록해주세요.");
        return null;
      }

      return {
        lang,
        category: values.category || "",
        title: values.title || "",
        thumbImgPc: toImageMeta(values.imgPc),
        thumbImgMo: toImageMeta(values.imgMo),
        showYn: values.status === "active" ? "Y" : "N",
        content: content || "",
        publish_date: values.publish_date || null,
      };
    },
    setValue: (key, value) => {
      setValue(key, value);
      if (key === "content1" && editorRef.current) {
        editorRef.current.setContent?.(value);
      }
    },
  }));

  return (
    <FormProvider {...methods}>
      <form className="space-y-6 p-6">
        <Select
          id="category"
          label="카테고리"
          value={watch("category")}
          onChange={(e) => setValue("category", e.target.value)}
          required
          disabled={readOnly}
        >
          <option value="">카테고리 선택</option>
          {categoryList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.value}
            </option>
          ))}
        </Select>

        <Input
          id="title"
          label="제목"
          {...register("title", { required: true })}
          disabled={readOnly}
        />

        <Upload
          name="imgPc"
          label="PC 썸네일 이미지"
          required
          classification="press&media"
          readOnly={readOnly}
        />

        <Upload
          name="imgMo"
          label="모바일 썸네일 이미지"
          required
          classification="press&media"
          readOnly={readOnly}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">노출 여부</p>
          <div className="flex gap-4">
            <Radio
              name="status"
              value="active"
              label="노출"
              checked={watch("status") === "active"}
              onChange={() => setValue("status", "active")}
              disabled={readOnly}
            />
            <Radio
              name="status"
              value="inactive"
              label="비노출"
              checked={watch("status") === "inactive"}
              onChange={() => setValue("status", "inactive")}
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">내용</p>
          <Editor ref={editorRef} readOnly={readOnly} />
        </div>

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
            readOnly={readOnly}
          />
        </div>
      </form>
    </FormProvider>
  );
});

export default PressRegistForm;
