import { useEffect, useState } from "react";
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

export default function TopContentForm({ data, setData }) {
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
                  control={methods.control}
                  render={({ field }) => (
                    <Upload
                      {...field}
                      label="이미지"
                      error={errors.etc?.[index]?.image?.message}
                      classification="whatson"
                    />
                  )}
                />
              </Row>

              <Row className="pb-4">
                <Select
                  id={`etc.${index}.type`}
                  label="콘텐츠 등록"
                  value={field.type}
                  onChange={(e) =>
                    setValue(`etc.${index}.type`, e.target.value)
                  }
                  required
                >
                  <option value="">선택해주세요</option>
                  {storiesList.map((item) => (
                    <option key={item.storiesId} value={item.storiesId}>
                      {item.title}
                    </option>
                  ))}
                </Select>
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
                    onClick={() => remove(index)}
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
}
