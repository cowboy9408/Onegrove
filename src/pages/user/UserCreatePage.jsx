import Button from "@/components/common/Button";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import FormSelect from "@/components/form/FormSelect";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import Row from "@/components/layout/Row";
import Section from "@/components/layout/Section";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

const schema = z
  .object({
    occupancy: z.string().min(1, "입주사를 선택해주세요."),
    name: z
      .string()
      .min(1, "이름은 필수값입니다.")
      .max(50, "이름은 50자 이내여야 합니다."),
    useYn: z.enum(["Y", "N"]).refine((val) => val === "Y" || val === "N", {
      message: "사용여부를 선택해주세요.",
    }),
    username: z
      .string()
      .min(4, "아이디는 4자 이상이여야 합니다.")
      .max(16, "아이디는 16자 이내여야 합니다.")
      .regex(
        /^[a-z0-9]{4,16}$/,
        "영소문자, 숫자를 포함하여 4~16자리 입력해 주세요."
      ),
    tel: z
      .string()
      .min(1, "전화번호는 필수값입니다.")
      .max(15, "전화번호는 15자 이내여야 합니다.")
      .regex(
        /^\d{2,3}-\d{3,4}-\d{4}$/,
        "하이픈 포함해서 휴대폰 번호를 입력해 주세요."
      ),
    email: z
      .string()
      .min(1, "이메일은 필수값입니다.")
      .max(100, "이메일은 100자 이내여야 합니다.")
      .email("이메일 형식이 올바르지 않습니다."),
    password1: z.string().max(10, "비밀번호는 최대 10자까지 가능합니다."),
    password2: z.string(),
  })
  .refine((data) => data.password1 === data.password2, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["password2"],
  });

export default function UserCreatePage() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [occupancyList, setOccupancyList] = useState([]);

  const nameId = useId();
  const usernameId = useId();
  const telId = useId();
  const emailId = useId();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      occupancy: "",
      name: "",
      useYn: "Y",
      username: "",
      tel: "",
      email: "",
    },
  });

  const {
    register,
    formState: { errors },
    resetField,
  } = methods;

  useEffect(() => {
    setOccupancyList([
      { value: "", label: "선택 없음" },
      { value: "1", label: "이모션" },
      { value: "2", label: "플래그원" },
    ]);
  }, []);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Section>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-8 p-4"
        >
          <Box className="mb-4 rounded-md border-2 border-gray-200">
            <Row className="pb-4">
              <Col>
                <FormSelect
                  label="입주사"
                  {...register(`occupancy`)}
                  error={errors.occupancy?.message}
                >
                  {occupancyList.map((item, index) => (
                    <option key={index} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </FormSelect>
              </Col>
            </Row>
            <Row className="pb-4">
              <Col>
                <FormInput
                  id={nameId}
                  label="이름"
                  fieldName={`name`}
                  maxLength={50}
                  required
                  showDefaultInfo={true}
                  placeholder="타이틀을 입력해주세요."
                  {...register(`name`)}
                  error={errors.name?.message}
                  onClear={() => resetField(`name`)}
                />
              </Col>
              <Col>
                <FormRadioGroup
                  label={"사용여부"}
                  options={[
                    { label: "사용", value: "Y" },
                    { label: "미사용", value: "N" },
                  ]}
                  name={`useYn`}
                  error={errors.useYn?.message}
                />
              </Col>
            </Row>
            <Row className="pb-4">
              <Col>
                <FormInput
                  id={usernameId}
                  label="아이디"
                  fieldName={`username`}
                  {...register(`username`)}
                  error={errors.username?.message}
                  onClear={() => resetField(`username`)}
                />
              </Col>
            </Row>
            <Row className="pb-4">
              <Col>
                <FormInput
                  label="비밀번호"
                  type="password"
                  fieldName={`password1`}
                  {...register(`password1`)}
                  error={errors.password1?.message}
                  onClear={() => resetField(`password1`)}
                />
              </Col>
              <Col>
                <FormInput
                  label="비밀번호 확인"
                  type="password"
                  fieldName={`password2`}
                  {...register(`password2`)}
                  error={errors.password2?.message}
                  onClear={() => resetField(`password2`)}
                />
              </Col>
            </Row>
            <Row className="pb-4">
              <Col>
                <FormInput
                  id={telId}
                  label="전화번호"
                  fieldName={`tel`}
                  type="tel"
                  regex="^[0-9\-]*$"
                  {...register(`tel`)}
                  error={errors.tel?.message}
                  onClear={() => resetField(`tel`)}
                />
              </Col>
              <Col>
                <FormInput
                  id={emailId}
                  label="이메일"
                  fieldName={`email`}
                  {...register(`email`)}
                  error={errors.email?.message}
                  onClear={() => resetField(`email`)}
                />
              </Col>
            </Row>
          </Box>

          <Row className="justify-end">
            <Button type="submit">저장</Button>
            <Button
              onClick={() => navigate(`/user?${searchParams.toString()}`)}
            >
              목록
            </Button>
          </Row>
        </form>
      </FormProvider>
    </Section>
  );
}
