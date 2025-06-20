import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import Select from "@/components/common/Select";
import FieldGroup from "@/components/form/FieldGroup";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import api from "@/lib/apiClient";

const MAX_ETC_LENGTH = 5;
const defaultItem = {
  category: "",
  image: { name: "", url: "", size: 0 },
};

const TopContentForm = forwardRef(({ data, setData }, ref) => {
  const methods = useForm({
    defaultValues: {
      etc: [defaultItem], // 기본 1개
    },
  });

  const {
    formState: { errors },
    reset,
    setValue,
  } = methods;
  const [storiesList, setStoriesList] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      reset({ etc: data });
    }
  }, [data]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get(
          "/api/v1/event-promotion/stories-list?lang=ko"
        );
        if (res.data.success) {
          setStoriesList(res.data.data);
        }
      } catch (error) {
        console.error("콘텐츠 리스트 불러오기 실패:", error);
      }
    };

    fetchStories();
  }, []);

  useImperativeHandle(ref, () => ({
    async submit(onError) {
      const isValid = await methods.trigger("etc");
      if (!isValid) {
        onError?.("필수 항목을 모두 입력해 주세요.");
        return null;
      }

      const values = methods.getValues();

      const prepareFile = (file, fallback) => {
        if (!file || !file.path) return {};
        const id = file.id;

        return {
          ...(typeof id === "number" ? { id } : {}),
          path: file.path,
          originalName: file.originalName ?? fallback?.originalName ?? "",
          name: file.name ?? fallback?.name ?? "",
          extension: file.extension ?? fallback?.extension ?? "",
          mime: file.mime ?? fallback?.mime ?? "",
          classification:
            file.classification ?? fallback?.classification ?? "whatson",
          size: file.size ?? fallback?.size ?? 0,
          status:
            file.status ??
            (fallback
              ? file.path !== fallback.path
                ? "E" // 변경됨
                : "R" // 유지됨
              : "C"), // 새로 추가
        };
      };

      const transformed = values.etc.map((item, index) => {
        const selectedStory = storiesList.find(
          (story) => String(story.storiesId) === String(item.type)
        );

        return {
          id: item.id ?? null,
          eventId: null,
          storiesId: Number(item.type),
          storiesTitle: selectedStory?.title ?? "",
          imgPc: prepareFile(item.image, item.prevImage),
          imgMo: null,
          sort: index + 1,
          delYn: "N",
        };
      });

      const result = [
        ...transformed,
        ...deletedIds
          .filter((id) => typeof id === "number")
          .map((id) => {
            const deletedItem = deletedItems.find((d) => d.id === id);
            if (!deletedItem) return null;

            const selectedStory = storiesList.find(
              (story) => String(story.storiesId) === String(deletedItem.type)
            );

            return {
              id: deletedItem.id,
              eventId: null,
              storiesId: Number(deletedItem.type),
              storiesTitle: selectedStory?.title ?? "",
              imgPc: prepareFile(deletedItem.image, deletedItem.prevImage),
              imgMo: null,
              sort: 0,
              delYn: "Y",
            };
          })
          .filter(Boolean),
      ];
      console.log("TopContentForm 제출 데이터:", result);
      return result;
    },
  }));

  return (
    <FormProvider {...methods}>
      <form className="space-y-8 p-4">
        <FieldGroup name="etc">
          {({ fields, field, index, append, remove }) => (
            <Box
              key={`${field.id}`}
              className="mb-2 rounded-md border-2 border-gray-200"
            >
              <Title title={`■ Stories of One Grove 콘텐츠 ${index + 1}`} />

              <Row className="pb-4">
                <Controller
                  name={`etc.${index}.image`}
                  rules={{
                    required: "필수 항목을 확인해주세요.",
                    validate: (file) => {
                      if (!file || !file.path)
                        return "필수 항목을 확인해주세요.";
                      return true;
                    },
                  }}
                  control={methods.control}
                  render={({ field }) => (
                    <Upload
                      {...field}
                      label="이미지"
                      error={errors.etc?.[index]?.image?.message}
                      classification="whatson"
                      required
                    />
                  )}
                />
              </Row>

              <Row className="pb-4">
                <Controller
                  name={`etc.${index}.type`}
                  control={methods.control}
                  rules={{
                    validate: (v) => v !== "" || "콘텐츠를 선택해 주세요.",
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      id={`etc.${index}.type`}
                      label="콘텐츠 등록"
                      error={errors.etc?.[index]?.type?.message}
                      required
                    >
                      <option value="">선택해주세요</option>
                      {storiesList.map((item) => (
                        <option key={item.storiesId} value={item.storiesId}>
                          {item.title}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </Row>

              <Row className="flex justify-center gap-2">
                {index === fields.length - 1 &&
                  fields.length < MAX_ETC_LENGTH && (
                    <Button
                      type="button"
                      onClick={() => append({ ...defaultItem })}
                    >
                      추가
                    </Button>
                  )}
                {index > 0 && (
                  <Button
                    type="button"
                    color="red"
                    onClick={() => {
                      const currentItem = methods.getValues(`etc.${index}`);
                      if (currentItem?.id) {
                        setDeletedIds((prev) => [...prev, currentItem.id]);
                        setDeletedItems((prev) => [...prev, currentItem]);
                      }
                      remove(index);
                    }}
                  >
                    삭제
                  </Button>
                )}
              </Row>
            </Box>
          )}
        </FieldGroup>
      </form>
    </FormProvider>
  );
});
export default TopContentForm;
