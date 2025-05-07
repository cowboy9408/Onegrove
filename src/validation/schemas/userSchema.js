import { z } from "zod";

const usernameRegex = /^[a-zA-Z0-9]{4,12}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;

export const userSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력해주세요."),
  id: z.string().regex(usernameRegex, "아이디는 영문+숫자 4~12자입니다."),
  password: z.string().regex(passwordRegex, "비밀번호는 영문+숫자 8~16자입니다."),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  phone: z.string().regex(phoneRegex, "올바른 전화번호 형식이 아닙니다."),

  // 셀렉트 박스 유효성 검사
  office: z.string().min(1, "오피스를 선택해주세요."),
  floor: z.string().min(1, "층 수를 선택해주세요."),
});
