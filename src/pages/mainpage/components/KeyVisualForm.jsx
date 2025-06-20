import { useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import {
  useForm,
  FormProvider,
  Controller,
  useFieldArray,
} from "react-hook-form";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import Button from "@/components/common/Button";

const MAX_KV_LENGTH = 4;

const KeyVisualForm = forwardRef(
  ({ data = [], lang = "KO", mainId = null }, ref) => {
    const methods = useForm({
      defaultValues: { kv: data && Array.isArray(data) ? data : [] },
    });
    const { control, register, reset, resetField, getValues } = methods;

    const deletedIdRef = useRef([]);

    const { fields, append, remove } = useFieldArray({
      control,
      name: "kv",
    });

    useEffect(() => {
      deletedIdRef.current = [];
      reset({
        kv:
          Array.isArray(data) && data.length > 0
            ? data
            : [
                {
                  type: "image",
                  title: "",
                  subtitle: "",
                  file1: null,
                  file2: null,
                },
              ],
      });
    }, [data]);

    useImperativeHandle(ref, () => ({
      submit: async (onError) => {
        const inputList = getValues("kv") || [];
        const validList = inputList.filter(
          (item) =>
            item.title && item.subtitle && item.file1?.path && item.file2?.path
        );

        if (!validList || validList.length === 0) {
          return onError?.("필수 항목을 확인해주세요.");
        }

        // 기존 ID 리스트
        const previousIds = (data || []).map((d) => d.id).filter(Boolean);
        const currentIds = validList.map((item) => item.id).filter(Boolean);
        const deletedIds = previousIds.filter((id) => !currentIds.includes(id));
        deletedIdRef.current = [];

        return {
          currentUser: 1,
          ...(mainId ? { mainId } : {}),
          lang: lang.toUpperCase(),
          keyVisualList: [
            ...validList.map((item, index) => ({
              currentUser: 1,
              ...(mainId ? { mainId } : {}),
              id: item.id ?? null,
              title: item.title,
              subTitle: item.subtitle,
              contentType: item.type === "image" ? "I" : "V",
              sort: String(index + 1),
              delYn: "N",
              pcFile: item.file1,
              moFile: item.file2,
            })),
            ...deletedIds.map((id, idx) => ({
              currentUser: 1,
              ...(mainId ? { mainId } : {}),
              sort: 999 + idx, // ✔️ 서버 유효성 검사 통과용
              contentType: "I",
              id,
              delYn: "Y",
            })),
          ],
        };
      },
    }));

    return (
      <FormProvider {...methods}>
        <form className="space-y-8 p-4">
          <FieldGroup name="kv">
            {({ fields, field, index, append, remove }) => (
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
                  />
                </Row>

                <Row className="pb-4">
                  <Controller
                    name={`kv.${index}.file1`}
                    control={control}
                    render={({ field }) => (
                      <Upload
                        {...field}
                        label="PC 이미지"
                        acceptWith={`kv.${index}.type`}
                        required
                      />
                    )}
                  />
                </Row>

                <Row className="pb-4">
                  <Controller
                    name={`kv.${index}.file2`}
                    control={control}
                    render={({ field }) => (
                      <Upload
                        {...field}
                        label="MO 이미지"
                        acceptWith={`kv.${index}.type`}
                        required
                      />
                    )}
                  />
                </Row>

                <Row className="pb-4">
                  <FormInput
                    label="타이틀"
                    fieldName={`kv.${index}.title`}
                    maxLength={50}
                    required
                    placeholder="타이틀 입력"
                    {...register(`kv.${index}.title`)}
                    onClear={() => resetField(`kv.${index}.title`)}
                  />
                </Row>

                <Row className="pb-4">
                  <FormInput
                    label="서브타이틀"
                    fieldName={`kv.${index}.subtitle`}
                    maxLength={100}
                    required
                    placeholder="서브타이틀 입력"
                    {...register(`kv.${index}.subtitle`)}
                    onClear={() => resetField(`kv.${index}.subtitle`)}
                  />
                </Row>

                <Row className="flex justify-center gap-2">
                  {fields.length < MAX_KV_LENGTH &&
                    index === fields.length - 1 && (
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
                      onClick={() => {
                        const id = getValues(`kv.${index}.id`);
                        if (id) {
                          deletedIdRef.current.push(id); // 삭제된 ID 저장
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
  }
);

export default KeyVisualForm;
