import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormInput from "@/components/form/FormInput";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import {
  FormProvider,
  useForm,
  Controller,
  useFieldArray,
} from "react-hook-form";

const MAX_WORK_LENGTH = 6;

const WorkForm = forwardRef(function WorkForm({ data, setData }, ref) {
  const methods = useForm({
    defaultValues: {
      work: [{ title: "", subtitle: "", file1: null, file2: null }],
    },
  });

  const { reset, resetField, register, getValues } = methods;

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      reset({ work: data });
    }
  }, [data]); // 언어 탭 전환 시 반영되도록

  useImperativeHandle(ref, () => ({
    submit: async (onError) => {
      const inputList = methods.getValues("work") || [];

      // 유효한 항목만 필터링
      const validList = inputList.filter(
        (item) =>
          item.title && item.subtitle && item.file1?.path && item.file2?.path
      );

      const isValid = inputList.every(
        (item) =>
          item.title && item.subtitle && item.file1?.path && item.file2?.path
      );

      if (!isValid) {
        onError?.("필수 항목을 모두 입력해 주세요.");
        return null;
      }

      // 기존 ID 리스트 vs 현재 유효 리스트 비교
      const previousIds = (data || []).map((d) => d.id).filter(Boolean);
      const currentIds = validList.map((item) => item.id).filter(Boolean);
      const deletedIds = previousIds.filter((id) => !currentIds.includes(id));

      // 최종 결과 리턴
      return [
        ...validList.map((item, index) => ({
          currentUser: 1,
          id: item.id ?? null,
          title: item.title,
          subTitle: item.subtitle,
          sort: String(index + 1),
          delYn: "N",
          pcImg: item.file1,
          moImg: item.file2,
        })),
        ...deletedIds.map((id) => ({
          currentUser: 1,
          id,
          delYn: "Y",
        })),
      ];
    },
  }));

  return (
    <FormProvider {...methods}>
      {/*폼을 제출하면 상위에 전달 */}
      <form className="space-y-8 p-4">
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
                        required
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
                        required
                      />
                    )}
                  />
                </Row>

                <Row className="pb-4">
                  <FormInput
                    id={idTitle}
                    label="타이틀"
                    fieldName={`work.${index}.title`}
                    maxLength={150}
                    showDefaultInfo
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
                    maxLength={150}
                    showDefaultInfo
                    required
                    placeholder="서브타이틀을 입력해주세요."
                    {...register(`work.${index}.subtitle`)}
                    onClear={() => resetField(`work.${index}.subtitle`)}
                  />
                </Row>

                <Row className="flex justify-center gap-2">
                  {fields.length === index + 1 && fields.length < 6 && (
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
});

export default WorkForm;
