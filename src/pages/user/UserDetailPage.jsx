import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
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
    useYn: z.enum(["Y", "N"]),
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

export default function UserDetailPage() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [editable, setEditable] = useState(false);
  const [data, setData] = useState({});
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
      useYn: "",
      username: "",
      tel: "",
      email: "",
    },
  });

  const {
    register,
    formState: { errors },
    reset,
    resetField,
  } = methods;

  useEffect(() => {
    setOccupancyList([
      { value: "1", label: "이모션" },
      { value: "2", label: "플래그원" },
    ]);
    setData({
      occupancy: "2",
      name: "김그로브",
      username: "admin",
      tel: "010-1234-5678",
      email: "abcde@abcd.com",
      lockYn: "N",
      useYn: "Y",
      password1: "",
      password2: "",
    });
  }, []);

  useEffect(() => {
    reset(data);
  }, [data, reset]);

  const onSubmit = (data) => {
    console.log(data);
    setEditable(false);
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
                  disabled={!editable}
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
              {!editable && (
                <Col>
                  <Input
                    label="계정상태"
                    value={data.lockYn == "Y" ? "잠금" : "활성화"}
                    readOnly={!editable}
                  />
                </Col>
              )}
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
                  readOnly={!editable}
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
                  readOnly={!editable}
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
                  readOnly={!editable}
                />
              </Col>
            </Row>
            {editable && (
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
            )}
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
                  readOnly={!editable}
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
                  readOnly={!editable}
                />
              </Col>
            </Row>
          </Box>

          {!editable ? (
            <Row className="justify-end">
              <Button>계정 잠금 해지</Button>
              <Button>임시비밀번호 발급</Button>
              <Button onClick={() => setEditable(true)}>수정</Button>
              <Button
                onClick={() => navigate(`/user?${searchParams.toString()}`)}
              >
                목록
              </Button>
            </Row>
          ) : (
            <Row className="justify-end">
              <Button type="submit">저장</Button>
              <Button
                onClick={() => navigate(`/user?${searchParams.toString()}`)}
              >
                목록
              </Button>
            </Row>
          )}
        </form>
      </FormProvider>
    </Section>
  );
}
