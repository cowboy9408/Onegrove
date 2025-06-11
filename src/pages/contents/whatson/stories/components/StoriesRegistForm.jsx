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
    },
  });
  const { register, setValue, getValues, watch, control } = methods;
  const editorRef = useRef();
  const editorRef2 = useRef();
  const { showModal } = useModal();

  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState("00:00");
  const [isAddContent, setIsAddContent] = useState(false);





  const onSubmit = async (data) => {
    const content = await editorRef.current.getContent();
    const content1 = await editorRef2.current.getContent();
    console.log({
      ...data,
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
        const getCleanedImage = (img) => {
          if (img?.status === "D") return null;
          return img;
        };

        const values = {
          ...getValues(),
          thumbImg: getCleanedImage(watch("thumbImg")),
          patternTopPc: getCleanedImage(watch("patternTopPc")),
          patternTopMo: getCleanedImage(watch("patternTopMo")),
          patternBottomPc: getCleanedImage(watch("patternBottomPc")),
          patternBottomMo: getCleanedImage(watch("patternBottomMo")),
          storiesImgList1: getCleanedImage(watch("storiesImgList1")),
          storiesImgList2: getCleanedImage(watch("storiesImgList2")),
          storiesImgList3: getCleanedImage(watch("storiesImgList3"))
        };
        const content = await editorRef.current?.getContent?.();
        const content1 = await editorRef2.current?.getContent?.();
        const description = watch("description");
        const storiesImgCaption1 = watch("storiesImgCaption1");
        const storiesImgCaption2 = watch("storiesImgCaption2");
        const storiesImgCaption3 = watch("storiesImgCaption3");


        
  
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);
  
        const start = new Date(startDate);
        start.setHours(startHour, startMin, 0, 0);
        const startDateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")} ${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
  
        const end = new Date(endDate);
        end.setHours(endHour, endMin, 0, 0);
        const endDateStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")} ${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
  
        if (!values.category) {
          onError?.("카테고리를 입력해주세요.");
          return null;
        }
        if (!values.title) {
          onError?.("제목을 입력해주세요.");
          return null;
        }
        if (
          !values.thumbImg ||
          !values.patternTopPc ||
          !values.patternTopMo ||
          !values.patternBottomPc ||
          !values.patternBottomMo
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
        if (!endDate) {
          onError?.("이벤트 종료일과 시간을 선택해주세요.");
          return null;
        }
  
        if (!description || description.trim() === "") {
          onError?.("디스크립션을 입력해주세요.");
          return null;
        }
  
        console.log("검사 대상 값들:", {
          title: values.title,
          category: values.category,
          startDate: startDateStr,
          endDate: endDateStr,
          thumbImg: values.thumbImg,
          patternTopPc: values.patternTopPc,
          patternTopMo: values.patternTopMo,
          patternBottomPc: values.patternBottomPc,
          patternBottomMo: values.patternBottomMo,
          content,
          description,
        });
  
        if (
          !values.title?.trim() ||
          !values.category ||
          !startDate ||
          !endDate ||
          !values.thumbImg ||
          !values.patternTopPc ||
          !values.patternTopMo ||
          !values.patternBottomPc ||
          !values.patternBottomMo ||
          !content?.trim() ||
          !description?.trim()
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
            classification: "stories",
            path:
              file.path ||
              `https://assets.onegrove.kr/dev/stories/${file.originalName || file.name}`,
            status: file.status || "C",
          };
        };
  
        return {
          eventId: data?.id ?? null,
          lang,
          showYn: values.status === "active" ? "Y" : "N",
          order: Number(values.order) || 1,
          category: values.category,
          title: values.title || "",
          thumbImg: toImageMeta(values.thumbImg),
          patternTopPc: toImageMeta(values.patternTopPc),
          patternTopMo: toImageMeta(values.patternTopMo),
          patternBottomPc: toImageMeta(values.patternBottomPc),
          patternBottomMo: toImageMeta(values.patternBottomMo),
          storiesImgList1: toImageMeta(values.storiesImgList1),
          storiesImgList2: toImageMeta(values.storiesImgList2),
          storiesImgList3: toImageMeta(values.storiesImgList3),

          storiesImgCaption1: storiesImgCaption1 || "",
          storiesImgCaption2: storiesImgCaption2 || "",
          storiesImgCaption3: storiesImgCaption3 || "",
          content: content || "",
          content1: content1 || "",
          description: description || "",
          startDate: startDateStr,
          endDate: endDateStr,
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
            <Input label="카테고리" {...methods.register("category")} maxLength={50} required showDefaultInfo={true} />
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
              type="tel"
              info="노출순서 최대 설정값 : 100"
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
            name="thumbImg"
            label="썸네일 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("thumbImg")}
            onChange={(file) => setValue("thumbImg", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          
          />
          <Upload
            key={`patternTopPc-upload`}
            name="patternTopPc"
            label="페이지 상단 패턴 PC 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("patternTopPc")}
            onChange={(file) => setValue("patternTopPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
          <Upload
            name="patternTopMo"
            label="페이지 상단 패턴 모바일 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("patternTopMo")}
            onChange={(file) => setValue("patternTopMo", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
        </div>

        <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
          내용<span className="text-red-500">*</span>
        </p>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Editor
              ref={editorRef}
              readOnly={readOnly}
              initialContent={field.value}
              onChange={(val) => field.onChange(val)} // 에디터 내부 값 변경을 폼과 동기화
            />
          )}
        />


        <Button
          className="h-12 w-full"
          onClick={() => { setIsAddContent(!isAddContent)}}
        >
          {isAddContent ? '내용 추가 등록 취소' : '내용 추가' }
        </Button>

        <div className={`contetnt2 ${ !isAddContent && 'hidden'}`}>
          <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
            내용 추가
          </p>
          <Controller
            name="content2"
            control={control}
            render={({ field }) => (
              <Editor
                ref={editorRef2}
                readOnly={readOnly}
                initialContent={field.value}
                onChange={(val) => field.onChange(val)} // 에디터 내부 값 변경을 폼과 동기화
              />
            )}
          />
        </div>



        <div className="space-y-2 my-6">
          <Upload
            name="storiesImgList1"
            label="스와이프이미지 1"
            classification="stroies"
            readOnly={readOnly}
            value={watch("storiesImgList1")}
            onChange={(file) => setValue("storiesImgList1", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
          <Input {...methods.register("storiesImgCaption1")} info="스와이프이미지 1 캡션 영역" />

          <Upload
            name="storiesImgList2"
            label="스와이프이미지 2"
            classification="stroies"
            readOnly={readOnly}
            value={watch("storiesImgList2")}
            onChange={(file) => setValue("storiesImgList2", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
            className="mt-4"
          />
          <Input {...methods.register("storiesImgCaption2")} info="스와이프이미지 2 캡션 영역" />

          <Upload
            name="storiesImgList3"
            label="스와이프이미지 3"
            classification="stroies"
            readOnly={readOnly}
            value={watch("storiesImgList3")}
            onChange={(file) => setValue("storiesImgList3", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
            className="mt-4"
          />
          <Input {...methods.register("storiesImgCaption3")} info="스와이프이미지 3 캡션 영역" />
        </div>



        <div className="space-y-2">
          <Upload
            name="patternBottomPc"
            label="페이지 하단 패턴 PC 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("patternBottomPc")}
            onChange={(file) => setValue("patternBottomPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
          />
          <Upload
            name="patternBottomMo"
            label="페이지 하단 패턴 모바일 이미지"
            required
            classification="stroies"
            readOnly={readOnly}
            value={watch("patternBottomMo")}
            onChange={(file) => setValue("patternBottomMo", file)}
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