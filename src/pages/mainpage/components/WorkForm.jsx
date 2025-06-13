import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { Info } from "lucide-react";
import { useEffect, useId } from "react";
import { FormProvider, useForm } from "react-hook-form";

const MAX_WORK_IMAGE_LENGTH = 10;

export default function WorkForm({ data }) {
  const subtitleId1 = useId();
  const subtitleId2 = useId();

  const methods = useForm({
    defaultValues: {
      work: {
        subtitle1: "",
        subtitle2: "",
        file: [
          { name: "", url: "", size: 0 },
          { name: "", url: "", size: 0 },
          { name: "", url: "", size: 0 },
        ],
      },
    },
  });

  const {
    register,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset({ work: data });
  }, [data, reset]);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 p-4">
        <Box className="mb-2 rounded-md border-2 border-gray-200">
          <Title title={`■ Work 영역`} />
          <Row className="pb-4">
            <FormTextarea
              id={subtitleId1}
              label="서브타이틀1"
              required
              placeholder="서브타이틀을 입력해주세요"
              maxLength={50}
              {...register("work.subtitle1")}
              error={errors.work?.subtitle1?.message}
            />
          </Row>
          <Row className="pb-4">
            <FormTextarea
              id={subtitleId2}
              label="서브타이틀2"
              placeholder="서브타이틀을 입력해주세요"
              maxLength={50}
              {...register("work.subtitle2")}
              error={errors.work?.subtitle2?.message}
            />
          </Row>

          <FieldGroup name="work.file">
            {({ fields, index, append, remove }) => {
              return (
                <>
                  <Row className="pb-4">
                    <Upload
                      name={`work.file.${index}`}
                      label={`이미지 ${index + 1}`}
                      error={errors.work?.file?.[index]?.message}
                    />
                  </Row>
                  {fields.length == index + 1 && errors.work?.file?.message && (
                    <span className="mt-1 mb-4 flex items-center gap-1 pl-1 text-xs text-red-500">
                      <Info size={14} />
                      {errors.work?.file?.message}
                    </span>
                  )}
                  {fields.length == index + 1 && (
                    <Row className="flex justify-center">
                      {index + 1 < MAX_WORK_IMAGE_LENGTH && (
                        <Button onClick={() => append({ type: "image" })}>
                          추가
                        </Button>
                      )}
                      {index >= 3 && (
                        <Button onClick={() => remove(index)}>삭제</Button>
                      )}
                    </Row>
                  )}
                </>
              );
            }}
          </FieldGroup>
        </Box>

        <Row className="justify-end">
          <Button type="submit">저장</Button>
        </Row>
      </form>
    </FormProvider>
  );
}
