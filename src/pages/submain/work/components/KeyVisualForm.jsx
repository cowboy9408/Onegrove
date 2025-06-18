import { useEffect, forwardRef, useImperativeHandle } from "react";
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
    const watch = methods.watch;
    const { fields, append, remove } = useFieldArray({
      control,
      name: "kv",
      keyName: "formId",
    });

    useEffect(() => {
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
    }, [JSON.stringify(data)]);

    useImperativeHandle(ref, () => ({
      submit: async (onError) => {
        const inputList = getValues("kv") || [];
        const originalList = data || [];

        const prepareFile = (file, fallback) => {
          if (!file || !file.path) return fallback ?? null;

          return {
            path: file.path,
            originalName: file.originalName ?? fallback?.originalName ?? "",
            name: file.name ?? fallback?.name ?? "",
            extension: file.extension ?? fallback?.extension ?? "",
            mime: file.mime ?? fallback?.mime ?? "",
            classification:
              file.classification ?? fallback?.classification ?? "Work",
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

        const validList = inputList.map((item, index) => {
          const origin = originalList.find((o) => o.id === item.id) ?? {};

          const result = {
            id: item.id ?? null,
            contentType: item.type === "image" ? "I" : "V",
            title: item.title,
            subTitle: item.subtitle,
            sort: index + 1,
            delYn: "N",
            contentFilePc: prepareFile(item.file1, origin.contentFilePc),
            contentFileMo: prepareFile(item.file2, origin.contentFileMo),
          };

          return result;
        });

        const currentIds = validList.map((v) => v.id).filter(Boolean);
        const deletedIds = (originalList || [])
          .map((d) => d.id)
          .filter((id) => !currentIds.includes(id));

        return {
          id: mainId ?? undefined,
          lang: lang.toUpperCase(),
          keyVisualList: validList
            .map((v, index) => ({
              id: v.id,
              title: v.title,
              subTitle: v.subTitle,
              type: v.contentType,
              sort: (index + 1).toString(),
              delYn: "N",
              pcImg: v.contentFilePc,
              moImg: v.contentFileMo,
            }))
            .concat(
              deletedIds.map((id) => {
                const origin = originalList.find((d) => d.id === id) ?? {};
                return {
                  id,
                  delYn: "Y",
                  title: origin.title ?? "",
                  subTitle: origin.subTitle ?? "",
                  type: origin.type ?? "I",
                  sort: origin.sort?.toString() ?? "0",
                  pcImg: origin.contentFilePc ?? null,
                  moImg: origin.contentFileMo ?? null,
                };
              })
            ),
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
                    required
                  />
                </Row>

                <Row className="pb-4">
                  <Controller
                    name={`kv.${index}.file1`}
                    control={control}
                    render={({ field }) => {
                      const type = watch(`kv.${index}.type`); // 'image' or 'video'
                      const isVideo = type === "video";
                      return (
                        <Upload
                          {...field}
                          name={`kv.${index}.file1`}
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          label={isVideo ? "PC 영상" : "PC 이미지"}
                          accept={isVideo ? "video/*" : "image/*"}
                          required
                          classification="lifestyle"
                        />
                      );
                    }}
                  />
                </Row>

                <Row className="pb-4">
                  <Controller
                    name={`kv.${index}.file2`}
                    control={control}
                    render={({ field }) => {
                      const type = watch(`kv.${index}.type`);
                      const isVideo = type === "video";
                      return (
                        <Upload
                          {...field}
                          name={`kv.${index}.file2`}
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          label={isVideo ? "MO 영상" : "MO 이미지"}
                          accept={isVideo ? "video/*" : "image/*"}
                          required
                          classification="lifestyle"
                        />
                      );
                    }}
                  />
                </Row>

                <Row className="pb-4">
                  <FormInput
                    label="타이틀"
                    fieldName={`kv.${index}.title`}
                    maxLength={50}
                    showDefaultInfo
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
                    showDefaultInfo
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
);

export default KeyVisualForm;
