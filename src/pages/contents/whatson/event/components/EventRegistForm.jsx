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
import { useEffect, useState, useRef } from "react";
import { forwardRef, useImperativeHandle } from "react";
import api from "@/lib/apiClient";

const EventRegistForm = forwardRef(
  ({ setData, lang, readOnly = false }, ref) => {
    const methods = useForm(); // 전체 객체는 유지
    const {
      control,
      register,
      setValue,
      watch,
      trigger,
      getValues,
      handleSubmit,
    } = methods;
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
        const isValid = await trigger();
        if (!isValid) return null;

        const data = getValues();
        const content1 = await editorRef1.current?.getContent?.();
        const content2 = await editorRef2.current?.getContent?.();

        const isMissingRequired = () => {
          // if (!data.category) return true;
          // if (!data.title) return true;
          // if (!data.thumbnail?.name) return true;
          // if (!data.banner?.name) return true;
          // if (!data.extraImage?.name) return true;
          // if (!content1) return true;
          // if (!dateRange.startDate || !dateRange.endDate) return true;
          // if (!brands.length) return true;
          // if (!data.pcImage?.name) return true;
          // if (!data.mobileImage?.name) return true;
          // if (!content2) return true;
          // return false;
        };

        if (isMissingRequired()) {
          console.log("필수 항목 누락됨");
          showModal({
            title: "입력 확인",
            message: "필수 항목을 모두 입력해주세요.",
            showCancel: false,
          });
          return null;
        }

        const toImageMeta = (file) => {
          if (!file || !file.name) return null;

          const originalName = file.originalName || file.name;
          const extMatch = originalName.match(/\.\w+$/); // 정규식으로 확장자 추출
          const extension = extMatch ? extMatch[0] : ".jpg"; // 확장자 없으면 기본값

          return {
            id: null,
            originalName,
            name: file.name,
            size: file.size,
            extension: "." + file.originalName.split(".").pop(),
            mime: file.type || "image/png",
            classification: null,
            path: `C:\\\\upload\\/test\\${file.name}`,
            status: null,
          };
        };

        return {
          ...data,
          brandIds: brands.map((e) => e._id),
          content1,
          content2,
          ...dateRange,

          thumbImg: toImageMeta(data.thumbnail),
          imgBodyPc: toImageMeta(data.banner),
          imgBodyMo: toImageMeta(data.extraImage),
          imgPc: toImageMeta(data.pcImage),
          imgMo: toImageMeta(data.mobileImage),
        };
      },
    }));

    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(() => {})} className="space-y-6 p-6">
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
            name="thumbnail"
            label="썸네일 이미지"
            required
            readOnly={readOnly}
          />
          <Upload
            name="banner"
            label="PC 본문 이미지"
            required
            readOnly={readOnly}
          />
          <Upload
            name="extraImage"
            label="모바일 본문 이미지"
            required
            readOnly={readOnly}
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
            name="pcImage"
            label="PC 이미지"
            required
            readOnly={readOnly}
          />
          <Upload
            name="mobileImage"
            label="모바일 이미지"
            required
            readOnly={readOnly}
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
