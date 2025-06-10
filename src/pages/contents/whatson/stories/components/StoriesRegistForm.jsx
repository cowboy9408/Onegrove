import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import Datepicker from "@/components/common/Datepicker";
import Editor from "@/components/common/Editor";
import Button from "@/components/common/Button";
import Row from "@/components/layout/Row";
import Col from "@/components/layout/Col";
import BrandList from "@/components/modal/BrandList";
import useModal from "@/hooks/useModal";
import api from "@/lib/apiClient";
import Textarea from "@/components/common/Textarea";
import "react-datepicker/dist/react-datepicker.css";
import Checkbox from "@/components/common/Checkbox";

const EventRegistForm = forwardRef(({ data, lang, readOnly = false }, ref) => {
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      status: "inactive",
      progressStatus: "inProgress",
    },
  });
  const { register, setValue, getValues, watch, control } = methods;
  const editorRef = useRef();
  const editorRef2 = useRef();
  const [brands, setBrands] = useState([]);
  const { showModal } = useModal();

  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState("00:00");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isManualEndInput, setIsManualEndInput] = useState(false);
  const [manualEndText, setManualEndText] = useState("");
  const [isAddContent, setIsAddContent] = useState(false);


  useEffect(() => {
      // 카테고리 불러오기
      const fetchCategories = async () => {
        try {
          const res = await api.get("/api/v1/event-promotion/item/category");
          if (res.data?.success) {
            setCategoryOptions(res.data.data);
          }
        } catch (err) {
          console.error("카테고리 로딩 실패", err);
        }
      };
  
      fetchCategories();
    }, []);
  
    useEffect(() => {
      const fetchBrandName = async () => {
        const brandId = watch("brandId"); // watch는 즉시 값 반영이 어려울 수 있으므로 변수로 추출
        if (!brandId) return;
  
        try {
          const res = await api.get("/api/v1/event-promotion/item/brand?lang=ko");
          const brandList = res.data?.data ?? [];
  
          const found = brandList.find((b) => String(b.id) === String(brandId));
  
          if (found) {
            setBrands([{ _id: found.id, brand: found.brandName }]);
          }
        } catch (err) {
          console.error("브랜드 정보 불러오기 실패", err);
        }
      };
  
      fetchBrandName();
    }, [watch("brandId")]);
  
    useEffect(() => {
      register("manualEndInput");
      register("endInput");
    }, [register]);


  const onSubmit = async (data) => {
    const content = await editorRef.current.getContent();
    const content1 = await editorRef2.current.getContent();
    console.log({
      ...data,
      brandIds: brands.map((e) => e._id),
      content,
      content1
      // ...dateRange,
    });
  };

  useEffect(() => {
    if (data?.startDate) {
      const start = new Date(data.startDate);
      setStartDate(start);

      // 시간 문자열로 변환 (ex: "09:30")
      const hh = String(start.getHours()).padStart(2, "0");
      const mm = String(start.getMinutes()).padStart(2, "0");
      setStartTime(`${hh}:${mm}`);
    }

    if (data?.endDate) {
      const end = new Date(data.endDate);
      setEndDate(end);

      const hh = String(end.getHours()).padStart(2, "0");
      const mm = String(end.getMinutes()).padStart(2, "0");
      setEndTime(`${hh}:${mm}`);
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
      submit: async (onError) => {
        const values = {
          ...getValues(),
          thumbImg: watch("thumbImg"),
          imgBodyPc: watch("imgBodyPc"),
          imgBodyMo: watch("imgBodyMo"),
          imgPc: watch("imgPc"),
          imgMo: watch("imgMo"),
          description: watch("description"),
          endInput: watch("endInput"),
          manualEndInput: watch("manualEndInput"),
        };
        const content = await editorRef.current?.getContent?.();
        const content1 = await editorRef2.current?.getContent?.();
        const description = watch("description");
  
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);
  
        const start = new Date(startDate);
        start.setHours(startHour, startMin, 0, 0);
        const startDateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}T${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
  
        const end = new Date(endDate);
        end.setHours(endHour, endMin, 0, 0);
        const endDateStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}T${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
  
        if (!values.category) {
          onError?.("카테고리를 입력해주세요.");
          return null;
        }
        if (!values.title) {
          onError?.("제목을 입력해주세요.");
          return null;
        }
        if (
          !values.imgPc ||
          !values.imgMo ||
          !values.thumbImg ||
          !values.imgBodyPc ||
          !values.imgBodyMo
        ) {
          onError?.("이미지를 모두 등록해주세요.");
          return null;
        }
        if (!content || content.replace(/<[^>]+>/g, "").trim() === "") {
          onError?.("상세 내용을 입력해주세요.");
          return null;
        }
  
        if (!startDate) {
          onError?.("이벤트 시작일과 종료일을 선택해주세요.");
          return null;
        }
        if (!values.manualEndInput && (!endDate || !endTime)) {
          onError?.("이벤트 종료일과 시간을 선택해주세요.");
          return null;
        }
  
        if (
          values.manualEndInput &&
          (!values.endInput || values.endInput.trim() === "")
        ) {
          onError?.("종료 조건 텍스트를 입력해주세요.");
          return null;
        }
  
        if (brands.length === 0) {
          onError?.("브랜드를 선택해주세요.");
          return null;
        }
        if (!description || description.trim() === "") {
          onError?.("디스크립션을 입력해주세요.");
          return null;
        }
  
        console.log("검사 대상 값들:", {
          title: values.title,
          category: values.category,
          startDate: startDate,
          endDate: values.manualEndInput ? null : endDateStr,
          endInput: values.manualEndInput ? values.endInput : null,
  
          thumbImg: values.thumbImg,
          imgBodyPc: values.imgBodyPc,
          imgBodyMo: values.imgBodyMo,
          imgPc: values.imgPc,
          imgMo: values.imgMo,
          content,
          description,
          brands,
        });
  
        if (
          !values.title?.trim() ||
          !values.category ||
          !startDate ||
          (!values.manualEndInput && !endDate) ||
          (values.manualEndInput && !values.endInput?.trim()) ||
          !values.thumbImg ||
          !values.imgBodyPc ||
          !values.imgBodyMo ||
          !values.imgPc ||
          !values.imgMo ||
          !content?.trim() ||
          //        // !description?.trim() ||
          brands.length === 0
        ) {
          alert("모든 필수 항목을 입력해주세요.");
          return null;
        }
  
        const toImageMeta = (file) => {
          if (!file || !file.name) {
            console.warn("이미지 name 누락:", file);
            return null;
          }
  
          return {
            id: file.id ?? null,
            originalName: file.originalName || file.name,
            name: file.name,
            size: file.size,
            extension: "." + (file.originalName || file.name).split(".").pop(),
            mime: file.type || "image/png",
            classification: "event-promotion",
            path:
              file.path ||
              `https://assets.onegrove.kr/dev/event-promotion/${file.originalName || file.name}`,
            status: file.status || "C",
          };
        };
  
        return {
          eventId: data?.id ?? null,
          lang,
          showYn: values.status === "active" ? "Y" : "N",
          sort: Number(values.order) || 1,
          category: values.category,
          title: values.title || "",
          thumbImg: toImageMeta(values.thumbImg),
          imgBodyPc: toImageMeta(values.imgBodyPc),
          imgBodyMo: toImageMeta(values.imgBodyMo),
          imgPc: toImageMeta(values.imgPc),
          imgMo: toImageMeta(values.imgMo),
          content: content || "",
          content1: content1 || "",
          description: description || "",
          startDate: startDateStr,
          endDate: values.manualEndInput ? null : endDateStr,
          endInput: values.manualEndInput ? values.endInput : null,
          manualEndInput: values.manualEndInput,
          progressYn: values.progressStatus === "inProgress" ? "Y" : "N",
          brandId: brands[0]?._id ?? null,
          delYn: "N",
        };
      },
      setValue,
      setDescription: (desc) => {
        setValue("description", desc);
      },
      setContent: (html) => {
        editorRef.current?.setContent?.(html);
      },
    }));

  return (
    <FormProvider {...methods}>
      <form
        id="event-regist-form"
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-6 p-6"
      >

        <Input label="제목" {...methods.register("title")} required maxLength={100} showDefaultInfo={true} />

        {/* 내용 텍스트 공간 */}
        <Textarea
          id="description"
          name="description"
          label="디스크립션"
          value={watch("description")}
          onChange={(e) => setValue("description", e.target.value)}
          required
          maxLength={200}
        />

        {/* 카테고리 + 상태 */}
        <div className="flex justify-between items-end gap-4">
          <div className="w-1/2">
            <Input label="카테고리" {...methods.register("category")} maxLength={50} required />
          </div>
          <div className="w-1/2">
            <Input
              label="노출 순서"
              {...methods.register("order")}
              onInput={(e) => {
                let val = e.target.value.replace(/[^0-9]/g, ""); // 숫자만

                if (val !== "") {
                  const num = Math.max(1, Math.min(100, parseInt(val)));
                  val = String(num);
                }

                setValue("order", val === "" ? "" : Number(val));
              }}
              type="number"
            />
          </div>

          
        </div>
        
        <div className="flex justify-between items-end">
          <div className="w-1/2">
            <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
              노출 기간<span className="ml-1 text-red-500">*</span>
            </p>
            {/* 시작 날짜 + 시간 */}
            <div className="flex items-center gap-4">
              {/* 시작 날짜 + 시간 */}
              <div className="flex items-center gap-2">
                <Datepicker
                  mode="single"
                  selectedDate={startDate}
                  onSingleChange={(date) => {
                    setStartDate(date);
                    setValue("startDate", date?.toISOString());
                  }}
                  readOnly={readOnly}
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded border px-2 py-1"
                  disabled={readOnly}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold">~</span>
                <Checkbox
                  id="manualEnd"
                  checked={isManualEndInput}
                  onChange={(e) => {
                    setIsManualEndInput(e.target.checked);
                    setValue("manualEndInput", e.target.checked);
                  }}
                  disabled={readOnly}
                />

                {isManualEndInput ? (
                  <input
                    type="text"
                    value={manualEndText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setManualEndText(val);
                      setValue("endInput", val);
                    }}
                    placeholder="공백 포함 최대 10자"
                    className="w-52 rounded border px-2 py-1"
                    disabled={readOnly}
                  />
                ) : (
                  <>
                    <Datepicker
                      mode="single"
                      selectedDate={endDate}
                      onSingleChange={(date) => {
                        setEndDate(date);
                        setValue("endDate", date?.toISOString());
                      }}
                      readOnly={readOnly}
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="rounded border px-2 py-1"
                      disabled={readOnly}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="w-1/2 flex items-center gap-4 justify-end">
            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
              노출 여부<span className="ml-1 text-red-500">*</span>
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

        <div className="space-y-2">
          <Upload
            key={`thumbnail-upload`}
            name="thumbnail"
            label="썸네일 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgPc")}
            onChange={(file) => setValue("imgPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
          
          />
          <Upload
            name="banner"
            label="페이지 상단 패턴 PC 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyPc")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
          <Upload
            name="extraImage"
            label="페이지 상단 패턴 모바일 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyMo")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
        </div>

        <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
          내용<span className="text-red-500">*</span>
        </p>
        <Editor ref={editorRef} />


        <Button
          className="h-12 w-full"
          onClick={() => { setIsAddContent(!isAddContent)}}
        >
          내용 추가
        </Button>

        <div className={`contetnt2 ${ !isAddContent && 'hidden'}`}>
          <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
            내용 추가
          </p>
          <Editor ref={editorRef2} />
        </div>



        <div className="space-y-2 my-6">
          <Upload
            name="banner"
            label="PC 스와이프이미지 1"
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyPc")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />

          <Upload
            name="banner"
            label="PC 스와이프이미지 2"
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyPc")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />

          <Upload
            name="banner"
            label="PC 스와이프이미지 3"
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyPc")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
        </div>



         <div className="space-y-2 my-6">
          <Upload
            name="extraImage"
            label="MO 스와이프이미지 1"
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyMo")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
          <Upload
            name="extraImage"
            label="MO 스와이프이미지 2"
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyMo")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
          <Upload
            name="extraImage"
            label="MO 스와이프이미지 3"
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyMo")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
        </div>


        <div className="space-y-2">
          <Upload
            name="banner"
            label="페이지 하단 패턴 PC 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyPc")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
          <Upload
            name="extraImage"
            label="페이지 하단 패턴 모바일 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("imgBodyMo")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
        </div>

        

      </form>

    </FormProvider>
  );
});
export default EventRegistForm;