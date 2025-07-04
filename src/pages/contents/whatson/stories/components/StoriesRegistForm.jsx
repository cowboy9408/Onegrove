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

const StoriesRegistForm = forwardRef(
  ({ data, lang, readOnly = false }, ref) => {
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
    const [imageFields, setImageFields] = useState([1, 2, 3]); // 최소 3개 유지
    const [deletedImages, setDeletedImages] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState("00:00");
    const [endDate, setEndDate] = useState(null);
    const [endTime, setEndTime] = useState("00:00");
    const [isAddContent, setIsAddContent] = useState(false);

    const onSubmit = async (data) => {
      const content = await editorRef.current.getContent();
      const addContent = await editorRef2.current.getContent();
      console.log({
        ...data,
        content,
        addContent,
        // ...dateRange,
      });
    };

    useEffect(() => {
      if (data?.startDt) {
        const start = new Date(data.startDt);

        setStartDate(start);

        // 시간 문자열로 변환 (ex: "09:30")
        const hh = String(start.getHours()).padStart(2, "0");
        const mm = String(start.getMinutes()).padStart(2, "0");
        setStartTime(`${hh}:${mm}`);
      }

      if (data?.endDt) {
        const end = new Date(data.endDt);
        setEndDate(end);

        const hh = String(end.getHours()).padStart(2, "0");
        const mm = String(end.getMinutes()).padStart(2, "0");
        setEndTime(`${hh}:${mm}`);
      }

      if (data?.addContent !== "" && data?.addContent !== null) {
        setIsAddContent(true);
      }
    }, [data]);

    useEffect(() => {
      if (data?.storiesImgList?.length > 3) {
        const count = data.storiesImgList.length;
        setImageFields(Array.from({ length: count }, (_, i) => i + 1));
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
          storiesImgList3: getCleanedImage(watch("storiesImgList3")),
        };
        const content = await editorRef.current?.getContent?.();
        const addContent = await editorRef2.current?.getContent?.();
        const description = watch("description");

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

        const toImageMeta = (file, originalFile = null) => {
          if (!file || !(file.name || file.originalName)) return null;

          if (!file.path && !originalFile?.path) {
            console.warn(
              "이미지에 path가 없습니다. 저장 대상에서 제외됩니다.",
              file
            );
            return null;
          }

          const isSameImage =
            originalFile &&
            file?.path === originalFile?.path &&
            file?.originalName === originalFile?.originalName &&
            file?.size === originalFile?.size;

          let status = "C";

          if (isSameImage) {
            status = "R";
          } else if (originalFile) {
            status = "E";
          }

          return {
            id: file.id ?? null,
            siId: file.siId || originalFile?.siId || null,
            siFileId:
              status === "E"
                ? null
                : file.siFileId || originalFile?.siFileId || null,
            originalName: file.originalName || file.name,
            name: file.name || file.originalName,
            size: file.size ?? 0,
            extension: "." + (file.name || "").split(".").pop(),
            mime: file.mime || "image/png",
            classification: "StoriesImg",
            path: file.path || originalFile?.path || "",
            status,
            delYn: file.delYn || "N",
          };
        };

        const storiesImgList = imageFields
          .sort((a, b) => a - b)
          .map((i, idx) => {
            const img = values[`storiesImgList${i}`];
            if (!img) return null;

            const caption = values[`storiesImgCaption${i}`] || "";

            // 기존 이미지 찾아오기 (siFileId 기준으로 빠르게 탐색)
            const originalImg = (data?.storiesImgList || []).find(
              (o) => o?.siFileId && o?.siFileId === img?.siFileId
            );

            const fileMeta = toImageMeta(img, originalImg);
            fileMeta.sort = String(idx + 1);

            // 캡션만 바뀐 경우도 수정 상태로 처리
            if (
              originalImg &&
              (originalImg.caption || "") !== caption &&
              fileMeta.status === "R"
            ) {
              fileMeta.status = "E";
            }

            return {
              ...fileMeta,
              caption,
            };
          })
          .filter((item) => item && item.status !== "D" && item.delYn !== "Y")
          .map((item, idx) => ({
            ...item,
            sort: String(idx + 1),
          }));

        // 삭제된 이미지 반영

        const replacedImages = (data?.storiesImgList || [])
          .filter((originalImg) => {
            return !storiesImgList.some((newImg) => {
              return (
                originalImg?.siFileId === newImg?.siFileId &&
                originalImg?.path === newImg?.path &&
                originalImg?.name === newImg?.name
              );
            });
          })
          .map((img) => ({
            ...toImageMeta(img),
            status: "D",
            delYn: "Y",
          }));

        // 최종 이미지 리스트 구성
        const finalStoriesImgList = [
          ...storiesImgList, // 입력한 이미지 (R, E, C)
          ...replacedImages, // 누락된 기존 이미지 → D
          ...deletedImages
            .map((img) => {
              const meta = toImageMeta(img);
              if (!meta) return null;

              return {
                ...meta,
                status: "D",
                delYn: "Y",
                caption: img.caption || "",
                sort: img.sort || "",
              };
            })
            .filter(Boolean), // null 제거
        ];

        return {
          id: data?.id ?? null,
          lang,
          showYn: values.status === "active" ? "Y" : "N",
          sort: values.order.toString() || "",
          category: values.category,
          title: values.title || "",
          thumbImg: toImageMeta(values.thumbImg),
          patternTopPc: toImageMeta(values.patternTopPc),
          patternTopMo: toImageMeta(values.patternTopMo),
          patternBottomPc: toImageMeta(values.patternBottomPc),
          patternBottomMo: toImageMeta(values.patternBottomMo),
          storiesImgList: finalStoriesImgList,

          // storiesImgList: [
          //   {
          //     ...toImageMeta(values.storiesImgList1),
          //     caption: values.storiesImgCaption1 || "",
          //     sort: "1"
          //   },
          //   {
          //     ...toImageMeta(values.storiesImgList2),
          //     caption: values.storiesImgCaption1 || "",
          //     sort: "2"
          //   },
          //   {
          //     ...toImageMeta(values.storiesImgList3),
          //     caption: values.storiesImgCaption1 || "",
          //     sort: "3"
          //   },
          // ],
          content: content || "",
          addContent: isAddContent ? addContent || "" : "",
          description: description || "",
          startDt: startDateStr,
          endDt: endDateStr,
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
      setContent2: (html) => {
        editorRef2.current?.setContent?.(html);
      },
    }));

    return (
      <FormProvider {...methods}>
        <form
          id="event-regist-form"
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-6 p-6"
        >
          <Input
            label="제목"
            {...methods.register("title")}
            required
            maxLength={100}
            showDefaultInfo={true}
          />

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
          <div className="flex items-end justify-between gap-4">
            <div className="w-1/2">
              <Input
                label="카테고리"
                {...methods.register("category")}
                maxLength={50}
                required
                showDefaultInfo={true}
              />
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

          <div className="flex items-end justify-between">
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
                    selectedDate={new Date(startDate?.toISOString())}
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
                    selectedDate={
                      new Date(endDate ? endDate.toISOString() : new Date())
                    }
                    onSingleChange={(date) => {
                      setEndDate(date);
                      setValue("endDate", date?.toISOString());
                    }}
                    readOnly={readOnly}
                    startDate={startDate}
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
            <div className="flex w-1/2 items-center justify-end gap-4">
              <p className="text-sm font-medium whitespace-nowrap text-gray-800">
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
              classification="StoriesImg"
              readOnly={readOnly}
              value={watch("thumbImg")}
              onChange={(file) => setValue("thumbImg", file)}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              showDefaultInfo={true}
              info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
            />
            <Upload
              key={`patternTopPc-upload`}
              name="patternTopPc"
              label="페이지 상단 패턴 PC 이미지"
              required
              classification="StoriesImg"
              readOnly={readOnly}
              value={watch("patternTopPc")}
              onChange={(file) => setValue("patternTopPc", file)}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              showDefaultInfo={true}
              info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
            />
            <Upload
              name="patternTopMo"
              label="페이지 상단 패턴 모바일 이미지"
              required
              classification="StoriesImg"
              readOnly={readOnly}
              value={watch("patternTopMo")}
              onChange={(file) => setValue("patternTopMo", file)}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
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
            onClick={() => {
              const next = !isAddContent;
              setIsAddContent(next);
              if (!next) {
                editorRef2.current?.setContent?.("");
                setValue("addContent", "");
              }
            }}
          >
            {isAddContent ? "내용 추가 등록 취소" : "내용 추가"}
          </Button>

          <div className={`contetnt2 ${!isAddContent && "hidden"}`}>
            <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800">
              내용 추가
            </p>
            <Controller
              name="addContent"
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

          <div className="my-6 space-y-4">
            {imageFields.map((index) => (
              <div
                key={index}
                className="relative space-y-2 rounded-md border p-4 pb-12"
              >
                <Upload
                  name={`storiesImgList${index}`}
                  label={`스와이프이미지 ${index}`}
                  classification="StoriesImg"
                  readOnly={readOnly}
                  value={watch(`storiesImgList${index}`)}
                  onChange={(file) => setValue(`storiesImgList${index}`, file)}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  showDefaultInfo={true}
                  info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
                />
                <Input
                  {...methods.register(`storiesImgCaption${index}`)}
                  info={`스와이프이미지 ${index} 캡션 영역`}
                />

                {index >= 4 && (
                  <Button
                    type="button"
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 transform text-red-800"
                    onClick={() => {
                      const deletedImg = watch(`storiesImgList${index}`);
                      if (deletedImg) {
                        setDeletedImages((prev) => [...prev, deletedImg]);
                      }

                      const newFields = imageFields
                        .filter((i) => i !== index)
                        .sort((a, b) => a - b);

                      const reordered = newFields.map((_, idx) => idx + 1);
                      setImageFields(reordered);

                      reordered.forEach((newIdx, i) => {
                        const oldIdx = newFields[i];
                        const oldImage = watch(`storiesImgList${oldIdx}`);
                        const oldCaption = watch(`storiesImgCaption${oldIdx}`);
                        setValue(`storiesImgList${newIdx}`, oldImage);
                        setValue(`storiesImgCaption${newIdx}`, oldCaption);
                      });

                      const max = Math.max(...imageFields);
                      setValue(`storiesImgList${max}`, null);
                      setValue(`storiesImgCaption${max}`, "");
                    }}
                  >
                    삭제
                  </Button>
                )}
              </div>
            ))}

            {imageFields.length < 10 && (
              <Button
                type="button"
                className="bg-black-100 mt-2"
                onClick={() => {
                  const nextIndex = Math.max(...imageFields) + 1;
                  setImageFields([...imageFields, nextIndex]);
                }}
              >
                추가
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Upload
              name="patternBottomPc"
              label="페이지 하단 패턴 PC 이미지"
              required
              classification="StoriesImg"
              readOnly={readOnly}
              value={watch("patternBottomPc")}
              onChange={(file) => setValue("patternBottomPc", file)}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              showDefaultInfo={true}
              info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
            />
            <Upload
              name="patternBottomMo"
              label="페이지 하단 패턴 모바일 이미지"
              required
              classification="StoriesImg"
              readOnly={readOnly}
              value={watch("patternBottomMo")}
              onChange={(file) => setValue("patternBottomMo", file)}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              showDefaultInfo={true}
              info="20MB 이하의 JPG, JPEG, PNG 파일 1개"
            />
          </div>
        </form>
      </FormProvider>
    );
  }
);
export default StoriesRegistForm;
