import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 주말(토/일) 판별
export function isWeekend(date) {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6;
}

// 간단 공휴일(예시: 1/1, 3/1, 5/5, 8/15, 10/3, 12/25)
export function isHoliday(date) {
  const d = new Date(date);
  const mmdd = `${d.getMonth() + 1}/${d.getDate()}`;
  const holidays = [
    "1/1", // 신정
    "3/1", // 삼일절
    "5/5", // 어린이날
    "8/15", // 광복절
    "10/3", // 개천절
    "12/25", // 성탄절
  ];
  return holidays.includes(mmdd);
}

export function getBusinessDaysDiff(from, to) {
  let count = 0;
  let current = new Date(from);
  const end = new Date(to);
  while (current < end) {
    if (!isWeekend(current) && !isHoliday(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * 에러 응답에서 메시지를 안전하게 추출합
 * "400 BAD_REQUEST \"메시지\"" 형식에서 따옴표 안의 메시지만 추출합니다.
 * @param {Object} error - 에러 객체 (axios 에러 또는 일반 에러)
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 추출된 에러 메시지
 */
export const extractErrorMessage = (
  error,
  defaultMessage = "오류가 발생했습니다. 다시 시도해주세요."
) => {
  // 여러 경로에서 메시지 찾기 (크로스체크)
  const rawMessage =
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    defaultMessage;

  // "400 BAD_REQUEST \"실제 메시지\"" 형식에서 따옴표 안의 메시지 추출
  const quotedMatch = rawMessage.match(/[""]([^"""]*)[""]/);
  if (quotedMatch && quotedMatch[1]) {
    return quotedMatch[1].trim();
  }

  // HTTP 상태 코드와 상태 텍스트 제거 (예: "400 BAD_REQUEST 메시지" -> "메시지")
  const cleanMessage = rawMessage.replace(/^\d+\s+[A-Z_]+\s+/, "").trim();

  return cleanMessage || defaultMessage;
};

/**
 * 성공 응답에서 메시지를 안전하게 추출합니다.
 * @param {Object} response - 응답 객체
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 추출된 메시지
 */
export const extractSuccessMessage = (
  response,
  defaultMessage = "작업이 완료되었습니다."
) => {
  const message =
    response?.data?.message || response?.message || defaultMessage;

  return message.trim();
};
