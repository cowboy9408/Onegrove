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

const MAX_WORK_LENGTH = 6;

export default function WorkForm({ data, setData }) {
  const methods = useForm({
    defaultValues: {
      work: [{ title: "", subtitle: "", file1: null, file2: null }],
    },
  });

  const { handleSubmit, reset, resetField, register } = methods;

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      reset({ work: data });
    }
  }, []); // 의존성 줄이기

  const onSubmit = (formValues) => {
    setData(formValues.work);
  };

  return (
    <FormProvider {...methods}>
      {/*폼을 제출하면 상위에 전달 */}
      <form onBlur={handleSubmit(onSubmit)} className="space-y-8 p-4">
        <FieldGroup name="work">
          {({ fields, field, index, append, remove }) => {
            const idTitle = `title-${field.id}`;
            const idSubtitle = `subtitle-${field.id}`;

            return (
              <Box
                key={field.id}
                className="mb-2 rounded-md border-2 border-gray-200"
              >
                <Title title={`■ Work 상단 콘텐츠 ${index + 1}`} />

                <Row className="pb-4">
                  <Controller
                    name={`work.${index}.file1`}
                    control={methods.control}
                    render={({ field }) => (
                      <Upload
                        {...field}
                        label="PC 이미지"
                        acceptWith={`work.${index}.type`}
                      />
                    )}
                  />
                </Row>
                <Row className="pb-4">
                  <Controller
                    name={`work.${index}.file2`}
                    control={methods.control}
                    render={({ field }) => (
                      <Upload
                        {...field}
                        label="MO 이미지"
                        acceptWith={`work.${index}.type`}
                      />
                    )}
                  />
                </Row>

                <Row className="pb-4">
                  <FormInput
                    id={idTitle}
                    label="타이틀"
                    fieldName={`work.${index}.title`}
                    maxLength={50}
                    required
                    placeholder="타이틀을 입력해주세요"
                    {...register(`work.${index}.title`)}
                    onClear={() => resetField(`work.${index}.title`)}
                  />
                </Row>

                <Row className="pb-4">
                  <FormInput
                    id={idSubtitle}
                    label="서브타이틀"
                    fieldName={`work.${index}.subtitle`}
                    maxLength={100}
                    required
                    placeholder="서브타이틀을 입력해주세요."
                    {...register(`work.${index}.subtitle`)}
                    onClear={() => resetField(`work.${index}.subtitle`)}
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
