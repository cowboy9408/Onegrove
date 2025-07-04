import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

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
    "1/1",   // 신정
    "3/1",   // 삼일절
    "5/5",   // 어린이날
    "8/15",  // 광복절
    "10/3",  // 개천절
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
