import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FormInput from "@/components/form/FormInput";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import BrandList from "@/components/modal/BrandList";
import useModal from "@/hooks/useModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

//스키마 정의
const schema = z.object({
  brandIntro: z.object({  
    name: z.string().min(1, "브랜드명은 필수입니다."),
    description: z
      .string()
      .min(1, "브랜드 설명은 필수입니다.")
      .max(300, "최대 300자까지 입력 가능합니다."),
    relatedBrands: z.array(z.number()).optional(),
  }),
});

export default function BrandIntroForm({ data, setData }) {
  const brandNameId = useId();
  const brandDescId = useId();
  const { showModal } = useModal();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      brandIntro: {
        name: "",
        description: "",
        relatedBrands: [],
      },
    },
  });

  const {
    register,
    formState: { errors },
    setValue,
    reset,
  } = methods;

  const [selectedBrands, setSelectedBrands] = useState([]);

  useEffect(() => {
    if (data && typeof data.name === "string") {
      reset({ brandIntro: data });
  
      const relatedIds = data.relatedBrands || [];
  
      // 전체 브랜드 리스트는 직접 API로 받아오거나 상위에서 넘겨받는 걸 추천
      const allBrands = [
        { _id: 1, brand: "Uniqlo" },
        { _id: 2, brand: "SHESMISS" },
        // ... 등등
      ];
  
      const matched = allBrands.filter((b) => relatedIds.includes(b._id));
      setSelectedBrands(matched);
    }
  }, [data, reset]);

  useEffect(() => {
    const subscription = methods.watch((value) => {
      setData?.(value.brandIntro);
    });
    return () => subscription.unsubscribe();
  }, [methods, setData]);

  const onSubmit = (formData) => {
    console.log("제출 데이터 ▶", formData);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 p-4">
        <Box className="mb-2 rounded-md border-2 border-gray-200">
          <Title title="■ 브랜드 관리" />
          <Row className="pb-4">
            <FormInput
              id={brandNameId}
              label="메인타이틀"
              placeholder="브랜드명을 입력해주세요"
              maxLength={50}
              required
              {...register("brandIntro.name")}
              fieldName="brandIntro.name"
              error={errors.brandIntro?.name?.message}
            />
          </Row>
          <Row className="pb-4">
            <FormTextarea
              id={brandDescId}
              label="서브타이블"
              placeholder="브랜드 설명을 입력해주세요"
              maxLength={300}
              required
              {...register("brandIntro.description")}
              error={errors.brandIntro?.description?.message}
            />
          </Row>
          <Row className="pb-4">
            <Col className="flex-5">
              <Input
                label="관련 브랜드"
                readOnly
                value={selectedBrands.map((b) => b.brand).join(", ")}
              />
              <FormInput
                className="hidden"
                fieldName="brandIntro.relatedBrands"
                {...register("brandIntro.relatedBrands")}
              />
            </Col>
            <Col className="flex self-end gap-2">
            <Button
  className="h-12 w-full"
  onClick={() =>
    showModal({
      title: "브랜드 선택",
      children: ({ closeModal }) => (
        <BrandList
        selected={selectedBrands.map((b) => b._id)}
        closeModal={closeModal}
        onAlert={(message) => {
          showModal({
            title: "안내",
            children: <p>{message}</p>,
            showCancel: false,
          });
        }}
        onConfirm={(result) => {
          if (!Array.isArray(result) || result.length === 0) {
            showModal({
              title: "안내",
              children: <p>브랜드를 1개 선택해주세요.</p>,
              showCancel: false,
            });
            return;
          }
      
          if (result.length > 1) {
            showModal({
              title: "안내",
              children: <p>브랜드는 1개만 선택 가능합니다.</p>,
              showCancel: false,
            });
            return;
          }
      
          // 실제 저장 처리
          const selected = result[0]; // 하나만 선택되었으므로
          setSelectedBrands([selected]);
      
          const brandIds = [selected._id];
          setValue("brandIntro.relatedBrands", brandIds, {
            shouldValidate: true,
            shouldDirty: true,
          });
          methods.trigger("brandIntro.relatedBrands");
      
          const formValues = methods.getValues();
          if (setData) {
            setData(formValues.brandIntro);
          }
      
          closeModal();
      
          setTimeout(() => {
            showModal({
              title: "알림",
              children: <p>저장되었습니다.</p>,
              showCancel: false,
            });
          }, 100);
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
        </Box>
      </form>
    </FormProvider>
  );
}
