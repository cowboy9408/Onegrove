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
import { forwardRef, useImperativeHandle } from "react";

const MAX_KV_LENGTH = 4;

const KeyVisualForm = forwardRef(({ data }, ref) => {
  const methods = useForm({
    defaultValues: {
      kv: [
        { type: "image", title: "", subtitle: "", file1: null, file2: null },
      ],
    },
  });

  const { reset, resetField, register, getValues } = methods;

  useEffect(() => {
    if (Array.isArray(data)) {
      const mappedData =
        data.length > 0
          ? data.map((item) => ({
              ...item,
              file1: item.contentFilePc?.path
                ? { path: item.contentFilePc.path }
                : null,
              file2: item.contentFileMo?.path
                ? { path: item.contentFileMo.path }
                : null,
            }))
          : [
              {
                type: "image",
                title: "",
                subtitle: "",
                file1: null,
                file2: null,
              },
            ];

      reset({ kv: mappedData });
    }
  }, [data]);

  const toImageMeta = (file) => {
    if (!file || !file.path) return null;

    const originalName = file.originalName || file.name || "";
    const extension = file.extension || "." + originalName.split(".").pop();

    return {
      id: file.id ?? null,
      originalName,
      name: file.name ?? originalName,
      size: file.size ?? 0,
      extension,
      mime: file.mime || "image/jpeg",
      classification: file.classification || "lifestyle",
      path: file.path,
      status: file.status ?? "C", // 기본은 신규
    };
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const values = getValues();

      // 필수 입력 체크
      const hasEmpty = values.kv.some((item) => {
        return !item.title || !item.subtitle || !item.file1;
      });

      if (hasEmpty) {
        alert("필수 항목이 비어 있습니다.");
        return null;
      }

      // API 전송용 데이터 포맷으로 변환
      const result = values.kv.map((item, index) => ({
        id: item.id ?? null, // <-- 기존 ID 유지
        contentType: item.type === "video" ? "V" : "I",
        contentFilePc: toImageMeta(item.file1),
        contentFileMo: toImageMeta(item.file2),
        title: item.title,
        subTitle: item.subtitle,
        sort: index + 1,
        delYn:
          item.file1?.status === "D" && item.file2?.status === "D" ? "Y" : "N",
      }));

      return result;
    },
  }));

  return (
    <FormProvider {...methods}>
      {/*폼을 제출하면 상위에 전달 */}
      <form className="space-y-8 p-4">
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
                        acceptWith={`kv.${index}.type`}
                        classification="lifestyle"
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
                        classification="lifestyle"
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
});

export default KeyVisualForm;
