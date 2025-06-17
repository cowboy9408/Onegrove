import { useForm, FormProvider, Controller } from "react-hook-form";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import Row from "@/components/layout/Row";
import Col from "@/components/layout/Col";
import Input from "@/components/common/Input";
import FormInput from "@/components/form/FormInput";
import useModal from "@/hooks/useModal";
import WhatsOnList from "@/components/modal/WhatsOnList";
import Box from "@/components/layout/Box";
import Title from "@/components/layout/Title";
import FieldGroup from "@/components/form/FieldGroup";
import { forwardRef, useImperativeHandle, useEffect } from "react";

const WhatContentForm = forwardRef(
  ({ data = [], lang = "KO", mainId = null }, ref) => {
    const methods = useForm();
    const { getValues, reset, setValue, control, register, watch } = methods;
    const { showModal } = useModal();
    const name = "contents";

    useEffect(() => {
      const transformed = Array.from(
        { length: Math.max(data.length, 2) },
        (_, i) => {
          const item = data[i];
          return item
            ? {
                id: item.id ?? null,
                contents: item.contents ?? [],
                selectedTitles: item.selectedTitles ?? "",
                uploadFile: item.uploadFile ?? null,
                sort: item.sort ?? i + 1,
              }
            : {
                id: null,
                contents: [],
                selectedTitles: "",
                uploadFile: null,
                sort: i + 1,
              };
        }
      );
      reset({ contents: transformed });
    }, [data, reset]);

    const handleContentSelect = (index, selectedItems) => {
      console.log("콘텐츠 선택됨:", selectedItems);
      setValue(
        `${name}.${index}.selectedTitles`,
        selectedItems.map((e) => e.title).join(", ")
      );

      setValue(
        `${name}.${index}.contents`,
        selectedItems.map((e) => ({
          _id: String(e._id),
          categoryCode: e.categoryCode,
          title: e.title,
        }))
      );
    };

    useImperativeHandle(ref, () => ({
      submit: async (onError) => {
        const values = getValues();
        console.log("폼 저장 값:", values);
        const contentList = values.contents || [];

        const mappedItems = contentList
          .filter((item) => !item?.isDeleted)
          .map((item, index) => {
            const file = item.uploadFile;
            const firstContent = Array.isArray(item.contents)
              ? item.contents[0]
              : null;
            return {
              id: item.id ?? null,
              contentId: firstContent?._id,
              contentCategoryCode: firstContent?.categoryCode,
              sort: index + 1,
              img: {
                id: file?.id ?? null,
                originalName: file?.originalName ?? "",
                name: file?.name ?? "",
                path: file?.path ?? "",
                size: file?.size ?? 0,
                extension: file?.extension ?? "",
                mime: file?.mime ?? "",
                classification: file?.classification ?? null,
                status: file?.status ?? "R",
              },
            };
          })
          .filter((item) => item.contentId && item.img.path);

        const previousIds = (data || []).map((item) => item.id).filter(Boolean);
        const currentIds = mappedItems.map((item) => item.id).filter(Boolean);
        const deletedIds = previousIds.filter((id) => !currentIds.includes(id));

        const whatContentList = [
          ...mappedItems,
          ...deletedIds.map((id) => ({
            id,
            delYn: "Y",
          })),
        ];

        if (whatContentList.length === 0) {
          return onError?.("최소 하나의 콘텐츠가 필요합니다.");
        }
        if (contentList.some((item) => !item.contents?.length)) {
          return onError?.("모든 콘텐츠 박스에 콘텐츠를 선택해주세요.");
        }
        return {
          mainId,
          lang: lang.toUpperCase(),
          whatContentList,
        };
      },
    }));

    return (
      <FormProvider {...methods}>
        <Box className="mb-2 rounded-md border-2 border-gray-200">
          <Title title="■ What’s On 콘텐츠" />

          <FieldGroup name={name}>
            {({ fields, index, append, remove }) => (
              <>
                <div className="px-4 pt-4 text-lg font-bold">• {index + 1}</div>

                <Row className="pb-4">
                  <Controller
                    name={`${name}.${index}.uploadFile`}
                    control={control}
                    render={({ field }) => (
                      <Upload
                        {...field}
                        value={field.value}
                        onChange={field.onChange}
                        label="대표 이미지 업로드"
                        classification="content"
                        required
                      />
                    )}
                  />
                </Row>
                <Row className="pb-4">
                  <Col className="flex-5">
                    <Input
                      label="콘텐츠 등록"
                      readOnly
                      required
                      value={
                        control._formValues[name]?.[index]?.selectedTitles || ""
                      }
                    />
                    <FormInput
                      className="hidden"
                      fieldName={`${name}.${index}.contents`}
                      {...register(`${name}.${index}.contents`)}
                    />
                  </Col>
                  <Col className="self-end">
                    <Button
                      className="h-12 w-full"
                      onClick={() => {
                        const selectedIds = (
                          watch(`${name}.${index}.contents`) || []
                        )
                          .filter((s) => s?._id)
                          .map((s) => String(s._id));

                        showModal({
                          title: "콘텐츠 검색",
                          children: ({ closeModal }) => (
                            <WhatsOnList
                              selected={selectedIds}
                              closeModal={closeModal}
                              onConfirm={(result) => {
                                handleContentSelect(index, result);
                                closeModal();
                              }}
                            />
                          ),
                          showCancel: true,
                          customButton: true,
                          size: "5xl",
                        });
                      }}
                    >
                      관리
                    </Button>
                  </Col>
                </Row>

                {index === fields.length - 1 && (
                  <Row className="flex justify-center gap-2">
                    {fields.length < 6 && (
                      <Button
                        type="button"
                        onClick={() =>
                          append({
                            contents: [],
                            selectedTitles: "",
                            uploadFile: null,
                          })
                        }
                      >
                        추가
                      </Button>
                    )}
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        color="red"
                        onClick={() => remove(index)}
                      >
                        삭제
                      </Button>
                    )}
                  </Row>
                )}
              </>
            )}
          </FieldGroup>
        </Box>
      </FormProvider>
    );
  }
);

export default WhatContentForm;
