import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormInput from "@/components/form/FormInput";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

const MAX_ETC_LENGTH = 5;

export default function EtcContentForm({ data }) {
  const methods = useForm({
    defaultValues: {
      etc: [
        {
          type: "simple",
          image: { name: "", url: "", size: 0 },
          url: "",
          title: "",
          subtitle: "",
          detail: "",
          button: "",
        },
      ],
    },
  });

  const {
    formState: { errors },
    reset,
    resetField,
    watch,
  } = methods;

  useEffect(() => {
    reset({ etc: data });
  }, [data, reset]);

  const onSubmit = (data) => {
    console.log(data);
  };
  const onInvalid = (errors) => {
    console.error(errors);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onInvalid)}
        className="space-y-8 p-4"
      >
        <FieldGroup name="etc">
          {({ field, index, register }) => {
            const type = watch(`etc.${index}.type`);

            return (
              <Box className="mb-2 rounded-md border-2 border-gray-200">
                <Title title={`■ 연계 콘텐츠 영역 `} />
                <Row className="pb-4"></Row>
                <Row className="pb-4">
                  <Upload
                    name={`etc.${index}.imagePC`}
                    label={`PC 이미지`}
                    error={errors.etc?.[index]?.image?.message}
                  />
                  <Upload
                    name={`etc.${index}.imageMO`}
                    label={`MO 이미지`}
                    error={errors.etc?.[index]?.image?.message}
                  />
                </Row>
                {type == "complex" && (
                  <Row className="pb-4">
                    <FormInput
                      id={`title-${field.id}`}
                      label="타이틀"
                      fieldName={`etc.${index}.title`}
                      maxLength={50}
                      showDefaultInfo={true}
                      required
                      placeholder="타이틀을 입력해주세요."
                      {...register(`etc.${index}.title`)}
                      error={errors.etc?.[index]?.title?.message}
                      onClear={() => resetField(`etc.${index}.title`)}
                    />
                  </Row>
                )}
                {type == "complex" && (
                  <Row className="pb-4">
                    <FormInput
                      id={`subtitle-${field.id}`}
                      label="서브타이틀"
                      fieldName={`etc.${index}.subtitle`}
                      maxLength={50}
                      showDefaultInfo={true}
                      required
                      placeholder="서브타이틀을 입력해주세요."
                      {...register(`etc.${index}.subtitle`)}
                      error={errors.etc?.[index]?.subtitle?.message}
                      onClear={() => resetField(`etc.${index}.subtitle`)}
                    />
                  </Row>
                )}
                {type == "complex" && (
                  <Row className="pb-4">
                    <FormTextarea
                      id={`detail-${field.id}`}
                      label="상세내용"
                      placeholder="상세내용을 입력해주세요"
                      maxLength={100}
                      {...register(`etc.${index}.detail`)}
                      error={errors.etc?.[index]?.detail?.message}
                    />
                  </Row>
                )}
                {type == "complex" && (
                  <Row className="pb-4">
                    <FormInput
                      id={`button-${field.id}`}
                      label="버튼명"
                      fieldName={`etc.${index}.button`}
                      maxLength={100}
                      showDefaultInfo={true}
                      required
                      placeholder="버튼명을 입력해주세요."
                      {...register(`etc.${index}.button`)}
                      error={errors.etc?.[index]?.button?.message}
                      onClear={() => resetField(`etc.${index}.button`)}
                    />
                  </Row>
                )}
              </Box>
            );
          }}
        </FieldGroup>

        <Row className="justify-end">
          <Button type="submit">저장</Button>
        </Row>
      </form>
    </FormProvider>
  );
}
