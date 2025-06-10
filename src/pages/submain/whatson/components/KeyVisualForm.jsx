import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";

const MAX_KV_LENGTH = 4;

export default function KeyVisualForm({ data, setData }) {
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      kv: [
        { type: "image", title: "", subtitle: "", file1: null, file2: null },
      ],
    },
  });

  const { handleSubmit, reset, resetField, register } = methods;
  

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      reset({ kv: data });
    }
  }, [data]); // 의존성 줄이기

  const onSubmit = (formValues) => {
    setData(formValues.kv);
  };

  return (
    <FormProvider {...methods}>
      {/*폼을 제출하면 상위에 전달 */}
      <form onBlur={handleSubmit(onSubmit)} className="space-y-8 p-4">
        <FieldGroup name="kv">
          {({ fields, field, index, append, remove }) => {
            const idTitle = `title-${field.id}`;
            const idSubtitle = `subtitle-${field.id}`;

            return (
              <Box
                key={field.id}
                className="mb-2 rounded-md border-2 border-gray-200"
              >
                <Title title={`■ Key Visual 이미지 ${index + 1}`} />

                <Row className="pb-4">
                  <FormRadioGroup
                    name={`kv.${index}.type`}
                    label="콘텐츠 형식"
                    options={[
                      { label: "이미지", value: "image" },
                      { label: "영상", value: "video" },
                    ]}
                    required
                  />
                </Row>

                <Row className="pb-4">
                  <Controller
                    name={`kv.${index}.file1`}
                    control={methods.control}
                    render={({ field }) => (
                      <Upload
                        {...field}
                        label="PC 이미지"
                        preview
                        acceptWith={`kv.${index}.type`}
                      />
                    )}
                  />
                </Row>
                <Row className="pb-4">
                  <Controller
                    name={`kv.${index}.file2`}
                    control={methods.control}
                    render={({ field }) => (
                      <Upload
                        {...field}
                        label="MO 이미지"
                        acceptWith={`kv.${index}.type`}
                      />
                    )}
                  />
                </Row>

                <Row className="pb-4">
                  <FormInput
                    id={idTitle}
                    label="타이틀"
                    fieldName={`kv.${index}.title`}
                    maxLength={50}
                    required
                    placeholder="타이틀을 입력해주세요"
                    {...register(`kv.${index}.title`)}
                    onClear={() => resetField(`kv.${index}.title`)}
                  />
                </Row>

                <Row className="pb-4">
                  <FormInput
                    id={idSubtitle}
                    label="서브타이틀"
                    fieldName={`kv.${index}.subtitle`}
                    maxLength={100}
                    required
                    placeholder="서브타이틀을 입력해주세요."
                    {...register(`kv.${index}.subtitle`)}
                    onClear={() => resetField(`kv.${index}.subtitle`)}
                  />
                </Row>

                <Row className="flex justify-center gap-2">
                  {fields.length === index + 1 && fields.length < 4 && (
                    <Button
                      type="button"
                      onClick={() =>
                        append({ type: "image", title: "", subtitle: "" })
                      }
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
            );
          }}
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
