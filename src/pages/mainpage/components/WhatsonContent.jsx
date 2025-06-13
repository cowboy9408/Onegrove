import { useFormContext } from "react-hook-form";
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

export default function WhatsonContent({ name = "contents" }) {
  const { control, register, setValue } = useFormContext();
  const { showModal } = useModal();

  const handleContentSelect = (index, selectedItems) => {
    setValue(
      `${name}.${index}.selectedTitles`,
      selectedItems.map((e) => e.title).join(", ")
    );
    setValue(
      `${name}.${index}.ids`,
      selectedItems.map((e) => e._id)
    );
  };

  return (
    <Box className="mb-2 rounded-md border-2 border-gray-200">
      <Title title="■ What’s On 콘텐츠" />

      <FieldGroup name={name}>
        {({ fields, index, append, remove }) => (
          <>
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
                  fieldName={`${name}.${index}.ids`}
                  {...register(`${name}.${index}.ids`)}
                />
              </Col>
              <Col className="self-end">
                <Button
                  className="h-12 w-full"
                  onClick={() =>
                    showModal({
                      title: "콘텐츠 검색",
                      children: ({ closeModal }) => (
                        <WhatsOnList
                          selected={[]}
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
                    })
                  }
                >
                  관리
                </Button>
              </Col>
            </Row>

            <Row className="pb-4">
              <Upload
                name={`${name}.${index}.uploadFile`}
                label="대표 이미지 업로드"
                classification="content"
                required
              />
            </Row>

            {index === fields.length - 1 && (
              <Row className="flex justify-center gap-2">
                {fields.length < 4 && (
                  <Button
                    type="button"
                    onClick={() =>
                      append({ ids: [], selectedTitles: "", uploadFile: null })
                    }
                  >
                    추가
                  </Button>
                )}
                {fields.length > 1 && (
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
  );
}
