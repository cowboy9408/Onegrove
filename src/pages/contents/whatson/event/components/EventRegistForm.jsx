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
import DateRangePicker from "@/components/common/Datepicker";
import Editor from "@/components/common/Editor";
import Button from "@/components/common/Button";
import Row from "@/components/layout/Row";
import Col from "@/components/layout/Col";
import BrandList from "@/components/modal/BrandList";
import useModal from "@/hooks/useModal";
import api from "@/lib/apiClient";

const EventRegistForm = forwardRef(
  ({ setData, lang, readOnly = false }, ref) => {
    const methods = useForm({ mode: "onChange" });
    const { register, setValue, getValues, watch, control } = methods;
    const editorRef1 = useRef();
    const editorRef2 = useRef();
    const [brands, setBrands] = useState([]);
    const { showModal } = useModal();
    const [dateRange, setDateRange] = useState({
      startDate: null,
      endDate: null,
    });
    const [categoryOptions, setCategoryOptions] = useState([]);

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

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const values = {
          ...getValues(),
          thumbImg: watch("thumbImg"),
          imgBodyPc: watch("imgBodyPc"),
          imgBodyMo: watch("imgBodyMo"),
          imgPc: watch("imgPc"),
          imgMo: watch("imgMo"),
        };
        const content = await editorRef1.current?.getContent?.();
        const description = await editorRef2.current?.getContent?.();

        console.log("검사 대상 값들:", {
          title: values.title,
          category: values.category,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
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
          !dateRange.startDate ||
          !dateRange.endDate ||
          !values.thumbImg ||
          !values.imgBodyPc ||
          !values.imgBodyMo ||
          !values.imgPc ||
          !values.imgMo ||
          !content?.trim() ||
          !description?.trim() ||
          brands.length === 0
        ) {
          alert("모든 필수 항목을 입력해주세요.");
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
            classification: "event-promotion",
            path: file.path,
            status: file.status ?? "C",
          };
        };

        // 필수 체크
        if (
          !values.title?.trim() ||
          !values.category ||
          !dateRange.startDate ||
          !dateRange.endDate ||
          !watch("thumbImg") ||
          !watch("imgBodyPc") ||
          !watch("imgBodyMo") ||
          !watch("imgPc") ||
          !watch("imgMo") ||
          !content?.trim() ||
          !description?.trim() ||
          brands.length === 0
        ) {
          alert("모든 필수 항목을 입력해주세요.");
          return null;
        }

        return {
          eventId: null,
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
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          brandId: brands[0]?._id,
          delYn: "N",
        };
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
                label="사용"
                checked={watch("status") === "active"}
                onChange={() => setValue("status", "active")}
                disabled={readOnly}
              />
              <Radio
                name="status"
                value="inactive"
                label="미사용"
                checked={watch("status") === "inactive"}
                onChange={() => setValue("status", "inactive")}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* 입력 필드 */}
          <Input
            label="노출 순서"
            {...register("order")}
            type="number"
            disabled={readOnly}
          />
          <Input
            label="타이틀"
            {...register("title")}
            required
            disabled={readOnly}
          />

          {/* 파일 업로드 */}
          <Upload
            key={`thumbImg-upload`}
            name="thumbImg"
            label="썸네일 이미지"
            required
            classification="event-promotion"
            readOnly={readOnly}
            value={watch("thumbImg")}
            onChange={(file) => {
              console.log("썸네일 이미지 등록됨:", file);
              setValue("thumbImg", file);
            }}
          />
          <Upload
            key={`imgBodyPc-upload`}
            name="imgBodyPc"
            label="PC 본문 이미지"
            required
            classification="event-promotion"
            readOnly={readOnly}
            value={watch("imgBodyPc")}
            onChange={(file) => {
              console.log("pc 본문 이미지 등록됨:", file);
              setValue("imgBodyPc", file);
            }}
          />
          <Upload
            key={`imgBodyMo-upload`}
            name="imgBodyMo"
            label="MO 본문 이미지"
            required
            classification="event-promotion"
            readOnly={readOnly}
            value={watch("imgBodyMo")}
            onChange={(file) => {
              console.log("mo 본문 이미지 등록됨:", file);
              setValue("imgBodyMo", file);
            }}
          />
          {/* 상세 내용 에디터 1 */}
          <p className="text-sm font-medium">
            상세 내용<span className="text-red-500">*</span>
          </p>
          <Editor ref={editorRef1} readOnly={readOnly} />

          {/* 날짜 선택 */}
          <p className="text-sm font-medium">
            이벤트 기간<span className="text-red-500">*</span>
          </p>
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            disabled={readOnly}
            onRangeChange={({ startDate, endDate }) =>
              setDateRange({ startDate, endDate })
            }
          />

          {/* 브랜드 선택 */}
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
                {...register("lifestyle.brand")}
                value={brands.map((e) => e._id).join(",")}
              />
            </Col>
            <Col className="self-end">
              <Button
                onClick={() =>
                  showModal({
                    title: "브랜드 선택",
                    customButton: true,
                    showCancel: true,
                    size: "5xl",
                    children: ({ closeModal }) => (
                      <BrandList
                        selected={brands.map((e) => e._id)}
                        closeModal={closeModal}
                        onConfirm={(result) => {
                          setBrands(result);
                          setValue(
                            "lifestyle.brand",
                            result.map((e) => e._id)
                          );

                          // 먼저 브랜드 선택 모달 닫기
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
            label="PC 이미지"
            required
            classification="press&media"
            readOnly={readOnly}
            value={watch("imgPc")}
            onChange={(file) => {
              console.log("PC 이미지 등록됨:", file);
              setValue("imgPc", file);
            }}
          />
          <Upload
            name="imgMo"
            label="모바일 이미지"
            classification="press&media"
            required
            readOnly={readOnly}
            value={watch("imgMo")}
            onChange={(file) => {
              console.log("모바일 이미지 업로드됨:", file);
              setValue("imgMo", file);
            }}
          />

          {/* 내용 에디터 2 */}
          <p className="text-sm font-medium">
            디스크립션<span className="text-red-500">*</span>
          </p>
          <Editor ref={editorRef2} readOnly={readOnly} />
        </form>
      </FormProvider>
    );
  }
);
export default EventRegistForm;
