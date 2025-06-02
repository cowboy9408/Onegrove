import {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
  useRef,
} from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import Upload from "@/components/common/Upload";
import Radio from "@/components/common/Radio";
import Editor from "@/components/common/Editor";
import Datepicker from "@/components/common/Datepicker";
import api from "@/lib/apiClient";

const PressRegistForm = forwardRef(({ data, lang, readOnly }, ref) => {
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      status: "inactive",
      publishDate: new Date().toISOString().split("T")[0],
    },
  });
  const { register, setValue, getValues, watch, control } = methods;
  const [singleDate, setSingleDate] = useState(new Date());
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
      setValue("publishDate", data.publishDate || "");
      setValue("imgPc", data.thumbImgPc || null);
      setValue("imgMo", data.thumbImgMo || null);
      editorRef.current?.setContent?.(data.content || "");
      if (data.publishDate) {
        setSingleDate(new Date(data.publishDate));
      } else {
        const today = new Date();
        const iso = today.toISOString().split("T")[0];
        setValue("publishDate", iso);
        setSingleDate(today);
      }

      console.log("값 세팅 완료");
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    submit: async (onError) => {
      const values = {
        ...getValues(),
        imgPc: watch("imgPc"),
        imgMo: watch("imgMo"),
      };
      console.log("최종 imgPc:", values.imgPc);
      console.log("최종 imgMo:", values.imgMo);

      const content = await editorRef.current?.getContent?.();

      if (!values.category) {
        onError?.("카테고리를 선택해주세요.");
        return null;
      }

      if (!values.title) {
        onError?.("제목을 입력해주세요.");
        return null;
      }

      if (!values.imgPc || !values.imgMo) {
        onError?.("PC 및 모바일 썸네일 이미지를 등록해주세요.");
        return null;
      }

      if (!content || content.replace(/<[^>]+>/g, "").trim() === "") {
        onError?.("내용을 입력해주세요.");
        return null;
      }

      if (!values.publishDate) {
        onError?.("발행일을 선택해주세요.");
        return null;
      }

      const toImageMeta = (file) => {
        if (!file || !file.name || !file.path) {
          console.warn("이미지 path 누락:", file);
          return null;
        }

        return {
          id: file.id ?? null,
          originalName: file.originalName || file.name,
          name: file.name,
          size: file.size,
          extension: "." + (file.originalName || file.name).split(".").pop(),
          mime: file.type || "image/png",
          classification: "press-media",
          path: file.path,
          status: file.status ?? "C",
        };
      };
      console.log("submit() values.imgPc:", values.imgPc);

      if (!values.imgPc || !values.imgMo) {
        alert("PC, 모바일 썸네일 이미지를 모두 등록해주세요.");
        return null;
      }

      return {
        id: data?.id,
        lang,
        category: values.category || "",
        title: values.title || "",
        thumbImgPc: toImageMeta(values.imgPc),
        thumbImgMo: toImageMeta(values.imgMo),
        showYn: values.status === "active" ? "Y" : "N",
        content: content || "",
        publishDate: values.publishDate || null,
      };
    },
    setValue: (key, value) => {
      setValue(key, value);
      if (key === "content" && editorRef.current) {
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

        <div>
          <Input
            id="title"
            label="제목"
            {...register("title", {
              required: true,
              maxLength: {
                value: 100,
                message: "제목은 공백 포함 100자 이하로 입력해주세요.",
              },
            })}
            disabled={readOnly}
            required
            maxLength={100}
            showDefaultInfo={true}
          />
          <p className="mt-1 text-right text-sm text-gray-500">
            {watch("title")?.length || 0}/100자
          </p>
          {watch("title")?.length > 100 && (
            <p className="text-sm text-red-500">100자 이내로 입력해주세요.</p>
          )}
        </div>

        <Upload
          key={`imgPc-upload`}
          name="imgPc"
          label="PC 썸네일 이미지"
          required
          classification="press&media"
          readOnly={readOnly}
          value={watch("imgPc")}
          onChange={(file) => setValue("imgPc", file)}
          showDefaultInfo={true}
          info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
        />

        <Upload
          name="imgMo"
          label="모바일 썸네일 이미지"
          classification="press&media"
          required
          readOnly={readOnly}
          value={watch("imgMo")}
          onChange={(file) => setValue("imgMo", file)}
          showDefaultInfo={true}
          info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
        />

        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">
            노출 여부<span className="text-red-500">*</span>
          </p>
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
              label="미노출"
              checked={watch("status") === "inactive"}
              onChange={() => setValue("status", "inactive")}
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">
            내용<span className="text-red-500">*</span>
          </p>
          {/* <Editor ref={editorRef} readOnly={readOnly} /> */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <Editor
                ref={editorRef}
                readOnly={readOnly}
                initialContent={field.value}
                // initialContent={existingBrandData?.description} // HTML 형태의 string
              />
            )}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">
            발행일<span className="text-red-500">*</span>
          </p>
          <Datepicker
            mode="single"
            selectedDate={singleDate}
            onSingleChange={(date) => {
              setSingleDate(date);
              const isoDate = date.toISOString().split("T")[0];
              setValue("publishDate", isoDate);
            }}
            readOnly={readOnly}
          />
        </div>
      </form>
    </FormProvider>
  );
});

export default PressRegistForm;
