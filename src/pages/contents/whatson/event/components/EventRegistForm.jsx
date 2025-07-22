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

const EventRegistForm = forwardRef(
  (
    { data, lang, readOnly = false, brands, setBrands, category, setCategory },
    ref
  ) => {
    const methods = useForm({
      mode: "onChange",
      defaultValues: {
        status: "inactive",
        progressStatus: data?.progressYn === "Y" ? "inProgress" : "ended",
      },
    });

    const { register, setValue, getValues, watch, control } = methods;
    const editorRef1 = useRef();
    const editorRef2 = useRef();
    const { showModal } = useModal();
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState("00:00");
    const [endDate, setEndDate] = useState(null);
    const [endTime, setEndTime] = useState("00:00");
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isManualEndInput, setIsManualEndInput] = useState(false);
    const [manualEndText, setManualEndText] = useState("");

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
          const res = await api.get(
            `/api/v1/event-promotion/item/brand?lang=${lang}`
          );

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
      if (data?.progressYn) {
        setValue(
          "progressStatus",
          data.progressYn === "Y" ? "inProgress" : "ended"
        );
      }
    }, [data, setValue]);

    useEffect(() => {
      if (data?.brandId) {
        setValue("brandId", data.brandId); // ← 이 줄을 새로 추가합니다!
      }
    }, [data?.brandId]);

    useEffect(() => {
      if (category) {
        setValue("category", category);
      }
    }, [category]);

    useEffect(() => {
      const newValue = data?.progressYn === "Y" ? "inProgress" : "ended";
      setTimeout(() => {
        setValue("progressStatus", newValue);
      }, 0);
    }, [data?.progressYn, setValue]);

    useEffect(() => {
      const subscription = watch((value, { name }) => {
        if (name === "category") {
          setCategory?.(value.category);
        }
      });
      return () => subscription.unsubscribe();
    }, [watch, setCategory]);

    useEffect(() => {
      register("manualEndInput");
      register("endInput");
    }, [register]);

    useEffect(() => {
      if (data) {
        const isManual =
          data.manualEndInput ||
          (!!data.endInput && (!data.endDate || data.endInput.trim() !== ""));
        setIsManualEndInput(isManual);
        setManualEndText(data.endInput || "");
        setValue("manualEndInput", isManual);
        setValue("endInput", data.endInput || "");

        if (!isManual) {
          setValue("endDate", data.endDate ? new Date(data.endDate) : null);
        }
      }
    }, [data]);

    useEffect(() => {
      if (data && Object.keys(data).length > 0 && categoryOptions.length > 0) {
        const matched = categoryOptions.find(
          (opt) => opt.code === data.category || opt.value === data.category
        );
        const categoryCode = matched?.code || "";

        setTimeout(() => {
          setValue("category", categoryCode);
        }, 1);

        // 나머지 필드 세팅
        setValue("title", data.title || "");
        setValue("status", data.showYn === "Y" ? "active" : "inactive");
        setValue("order", data.sort || 1);
        setValue("thumbImg", data.thumbImg || null);
        setValue("imgBodyPc", data.imgBodyPc || null);
        setValue("imgBodyMo", data.imgBodyMo || null);
        setValue("imgPc", data.imgPc || null);
        setValue("imgMo", data.imgMo || null);
        editorRef1.current?.setContent?.(data.content || "");
        editorRef2.current?.setContent?.(data.description || "");
      }
    }, [data, categoryOptions]);

    useEffect(() => {
      if (data?.startDate) {
        const utcStart = new Date(data.startDate);
        const kstStart = new Date(utcStart.getTime() + 9 * 60 * 60 * 1000);
        setStartDate(kstStart);

        const hh = String(kstStart.getHours()).padStart(2, "0");
        const mm = String(kstStart.getMinutes()).padStart(2, "0");
        setStartTime(`${hh}:${mm}`);
      }

      if (data?.endDate) {
        const utcEnd = new Date(data.endDate);
        const kstEnd = new Date(utcEnd.getTime() + 9 * 60 * 60 * 1000);
        setEndDate(kstEnd);

        const hh = String(kstEnd.getHours()).padStart(2, "0");
        const mm = String(kstEnd.getMinutes()).padStart(2, "0");
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
          imgBodyPc: getCleanedImage(watch("imgBodyPc")),
          imgBodyMo: getCleanedImage(watch("imgBodyMo")),
          imgPc: getCleanedImage(watch("imgPc")),
          imgMo: getCleanedImage(watch("imgMo")),
          description: watch("description"),
          endInput: watch("endInput"),
          manualEndInput: watch("manualEndInput"),
          progressYn: watch("progressStatus") === "inProgress" ? "Y" : "N",
        };
        const content = await editorRef1.current?.getContent?.();
        const description = watch("description");

        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        const start = new Date(startDate);
        start.setHours(startHour, startMin, 0, 0);
        const startDateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}T${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;

        const end = new Date(endDate);
        end.setHours(endHour, endMin, 0, 0);

        const pad = (n) => String(n).padStart(2, "0");
        const endDateStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(endHour)}:${pad(endMin)}:00`;

        if (!values.category) {
          onError?.("카테고리를 선택해주세요.");
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
          description: description || "",
          startDate: startDateStr,
          endDate: values.manualEndInput ? null : endDateStr,
          endInput: values.manualEndInput ? values.endInput : null,
          manualEndInput: values.manualEndInput,
          progressYn: watch("progressStatus") === "inProgress" ? "Y" : "N",
          brandId: brands[0]?._id ?? null,
          delYn: "N",
        };
      },
      setValue,
      setDescription: (desc) => {
        setValue("description", desc);
      },
      setContent: (html) => {
        editorRef1.current?.setContent?.(html);
      },
    }));

    return (
      <FormProvider {...methods}>
        <form className="space-y-6 p-6">
          {/* 카테고리 + 노출 여부 */}
          <div className="flex items-end justify-between">
            <Controller
              name="category"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  label="카테고리"
                  className="w-1/2"
                  {...field}
                  required
                  disabled={readOnly}
                >
                  <option value="">선택</option>
                  {categoryOptions.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.value}
                    </option>
                  ))}
                </Select>
              )}
            />

            <div className="flex items-center gap-4">
              <input type="hidden" {...register("status")} />
              <p className="text-sm font-medium text-gray-800">노출 여부</p>
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

          {/* 입력 필드 */}
          <Input
            label="노출 순서"
            type="number"
            value={watch("order") ?? ""}
            onInput={(e) => {
              let val = e.target.value.replace(/[^0-9]/g, ""); // 숫자만

              if (val !== "") {
                const num = Math.max(1, Math.min(100, parseInt(val)));
                val = String(num);
              }

              setValue("order", val === "" ? "" : Number(val));
            }}
            disabled={readOnly}
          />
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

          {/* 파일 업로드 */}
          <Upload
            key={`thumbImg-upload`}
            name="thumbImg"
            label="썸네일 이미지"
            required
            classification="event-promotion"
            readOnly={readOnly}
            value={watch("thumbImg")}
            onChange={(file) => setValue("thumbImg", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
          />
          <Upload
            key={`imgBodyPc-upload`}
            name="imgBodyPc"
            label="PC 본문 이미지"
            required
            classification="event-promotion"
            readOnly={readOnly}
            value={watch("imgBodyPc")}
            onChange={(file) => setValue("imgBodyPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
          />
          <Upload
            key={`imgBodyMo-upload`}
            name="imgBodyMo"
            label="MO 본문 이미지"
            required
            classification="event-promotion"
            readOnly={readOnly}
            value={watch("imgBodyMo")}
            onChange={(file) => setValue("imgBodyMo", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
          />
          {/* 상세 내용 에디터 1 */}
          <p className="text-sm font-medium">
            상세 내용<span className="text-red-500">*</span>
          </p>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <Editor
                ref={editorRef1}
                readOnly={readOnly}
                initialContent={field.value}
                onChange={(val) => field.onChange(val)} // 에디터 내부 값 변경을 폼과 동기화
              />
            )}
          />

          {/* 날짜 선택 */}
          <p className="min-w-[80px] text-sm font-medium text-gray-800">
            이벤트 기간<span className="ml-1 text-red-500">*</span>
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
              <Datepicker
                mode="time-only"
                selectedDate={new Date(`1970-01-01T${startTime}:00`)} // "HH:mm" → Date 객체로 변환
                onSingleChange={(date) => {
                  const hh = String(date.getHours()).padStart(2, "0");
                  const mm = String(date.getMinutes()).padStart(2, "0");
                  setStartTime(`${hh}:${mm}`);
                }}
                disabled={readOnly || isManualEndInput}
              />
            </div>
            <span>~</span>
            <div className="flex items-center gap-4">
              {/* 종료일 날짜 + 시간 */}
              <Datepicker
                mode="single"
                selectedDate={endDate}
                onSingleChange={(date) => {
                  setEndDate(date);
                  setValue("endDate", date?.toISOString());
                }}
                readOnly={readOnly}
                disabled={readOnly || isManualEndInput} // manual이면 readonly 처리
                startDate={startDate}
              />
              <Datepicker
                mode="time-only"
                selectedDate={new Date(`1970-01-01T${endTime}:00`)} // "HH:mm" → Date 객체로 변환
                onSingleChange={(date) => {
                  const hh = String(date.getHours()).padStart(2, "0");
                  const mm = String(date.getMinutes()).padStart(2, "0");
                  setEndTime(`${hh}:${mm}`);
                }}
                disabled={readOnly || isManualEndInput}
              />

              {/* 수동 입력 필드 (선택적 노출) */}
              {isManualEndInput && (
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
              )}

              {/* 체크박스 */}
              <Checkbox
                id="manualEnd"
                checked={isManualEndInput}
                onChange={(e) => {
                  setIsManualEndInput(e.target.checked);
                  setValue("manualEndInput", e.target.checked);
                }}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* 진행 상태 라디오 버튼 */}
          <div className="mt-4 flex items-center gap-4">
            <p className="min-w-[80px] text-sm font-medium text-gray-800">
              진행 상태<span className="ml-1 text-red-500">*</span>
            </p>
            <Controller
              name="progressStatus"
              control={control}
              render={({ field }) => (
                <>
                  <Radio
                    {...field}
                    value="inProgress"
                    checked={field.value === "inProgress"}
                    onChange={() => field.onChange("inProgress")}
                    label="진행"
                    disabled={readOnly}
                  />
                  <Radio
                    {...field}
                    value="ended"
                    checked={field.value === "ended"}
                    onChange={() => field.onChange("ended")}
                    label="종료"
                    disabled={readOnly}
                  />
                </>
              )}
            />
          </div>

          {/* 브랜드 선택 */}
          <Row className="pb-4">
            <Col className="flex-5">
              <Input
                label="노출 브랜드"
                readOnly
                required
                value={
                  Array.isArray(brands)
                    ? brands.map((e) => e.brand).join(", ")
                    : ""
                }
              />
              <input
                type="hidden"
                {...register("lifestyle.brand")}
                value={
                  Array.isArray(brands)
                    ? brands.map((e) => e._id).join(",")
                    : ""
                }
              />
            </Col>
            <Col className="flex gap-2 self-end">
              <Button
                onClick={() =>
                  showModal({
                    title: "브랜드 선택",
                    customButton: true,
                    showCancel: true,
                    size: "5xl",
                    children: ({ closeModal }) => (
                      <BrandList
                        selected={
                          Array.isArray(brands) ? brands.map((e) => e._id) : []
                        }
                        closeModal={closeModal}
                        lang={lang}
                        onConfirm={(result) => {
                          setBrands(result);
                          setValue(
                            "lifestyle.brand",
                            result.map((b) => b.id)
                          );

                          closeModal();

                          // 이후 모달 충돌 방지를 위해 setTimeout으로 알림 모달 띄움
                          setTimeout(() => {
                            showModal({
                              title: "알림",
                              children: <p>저장되었습니다.</p>,
                              showCancel: false,
                            });
                          }, 100);
                        }}
                      />
                    ),
                  })
                }
              >
                관리
              </Button>
            </Col>
          </Row>

          {/* 파일 업로드 2 */}
          <Upload
            key={`imgPc-upload`}
            name="imgPc"
            label="하단배너 PC 이미지"
            required
            classification="event-promotion"
            readOnly={readOnly}
            value={watch("imgPc")}
            onChange={(file) => setValue("imgPc", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
          />
          <Upload
            name="imgMo"
            label="하단배너 모바일 이미지"
            classification="event-promotion"
            required
            readOnly={readOnly}
            value={watch("imgMo")}
            onChange={(file) => setValue("imgMo", file)}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            showDefaultInfo={true}
            info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
          />

          {/* 내용 텍스트 공간 */}
          <Textarea
            id="description"
            name="description"
            label="하단배너 디스크립션"
            value={watch("description")}
            onChange={(e) => setValue("description", e.target.value)}
            required
            maxLength={250}
          />
        </form>
      </FormProvider>
    );
  }
);
export default EventRegistForm;
