import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/apiClient";
import {
  isWeekend,
  isHoliday,
  extractErrorMessage,
  extractSuccessMessage,
} from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export default function VisitForm({
  existingReservations = [],
  initialData = {},
  isEdit = false,
  onSubmit,
  closeModal,
}) {
  const { permission, companyId: userCompanyId } = useAuthStore();
  const isSecretary = permission === "OFFICE_SECRETARY_ADMIN";
  const [isComposing, setIsComposing] = useState(false);

  // 방문 인원 범위
  const MIN_VISITORS = 1;
  const MAX_VISITORS = 10;

  // 전화번호 입력 핸들러
  const handleTelChange = (e) => {
    const value = e.target.value;

    // 빈 값이거나 010만 남은 경우 (백스페이스로 모두 지운 경우)
    if (!value || value === "010") {
      if (prevTelRef.current !== "010-") {
        setTel("010-");
        prevTelRef.current = "010-";
      }
      return;
    }

    // 010-로 시작하지 않으면 숫자만 추출
    if (!value.startsWith("010-")) {
      const numbers = value.replace(/[^0-9]/g, "");
      const limitedNumbers = numbers.slice(0, 8);

      let newTel;
      if (limitedNumbers.length === 0) {
        newTel = "010-";
      } else if (limitedNumbers.length > 4) {
        newTel = `010-${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4, 8)}`;
      } else {
        newTel = `010-${limitedNumbers}`;
      }

      if (prevTelRef.current !== newTel) {
        setTel(newTel);
        prevTelRef.current = newTel;
      }
      return;
    }

    // 010-로 시작하는 경우
    const afterPrefix = value.substring(4);
    const numbers = afterPrefix.replace(/[^0-9]/g, "");
    const limitedNumbers = numbers.slice(0, 8);

    let newTel;
    if (limitedNumbers.length === 0) {
      newTel = "010-";
    } else if (limitedNumbers.length > 4) {
      newTel = `010-${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4, 8)}`;
    } else {
      newTel = `010-${limitedNumbers}`;
    }

    if (prevTelRef.current !== newTel) {
      setTel(newTel);
      prevTelRef.current = newTel;
    }
  };

  // [추가] extraVisitors 전용 업데이트 헬퍼
  const updateExtra = (idx, patch) => {
    setExtraVisitors((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, ...patch } : v))
    );
  };

  // [추가] 010-XXXX-XXXX 포맷 헬퍼 (대표/추가 방문자 공용)
  const formatTel010 = (value) => {
    if (!value || value === "010") return "010-";
    const starts = value.startsWith("010-");
    const digits = (starts ? value.slice(4) : value)
      .replace(/[^0-9]/g, "")
      .slice(0, 8);
    if (digits.length === 0) return "010-";
    if (digits.length > 4)
      return `010-${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `010-${digits}`;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (isComposing) {
      // 조합 중에는 그대로 입력
      setName(value);
    } else {
      // 조합이 끝난 후에만 필터 적용
      setName(value.replace(/[^가-힣a-zA-Z0-9\s]/g, ""));
    }
  };

  const handleChangeEmail = (e) => {
    const value = e.target.value;
    if (isComposing) {
      // 조합 중에는 그대로 입력
      setEmail(value);
    } else {
      // 조합이 끝난 후에만 필터 적용
      setEmail(value.replace(/[^가-힣a-zA-Z0-9@._-]/g, ""));
    }
  };
  const [companyId, setCompanyId] = useState(
    isSecretary
      ? String(userCompanyId)
      : isEdit
        ? initialData.companyId || ""
        : ""
  );

  const [visitNumber, setVisitNumber] = useState(
    isEdit ? initialData.visitNumber || "" : ""
  );

  const [extraVisitors, setExtraVisitors] = useState([]);

  useEffect(() => {
    const currentNum = Number(visitNumber || 0);
    const maxExtras = Math.max(0, Math.min(currentNum, MAX_VISITORS) - 1);
    if (extraVisitors.length > maxExtras) {
      setExtraVisitors((prev) => prev.slice(0, maxExtras));
    }
  }, [visitNumber, extraVisitors.length]);

  const [visitPurpose, setVisitPurpose] = useState(
    isEdit ? initialData.visitPurpose || "" : ""
  );
  const normalizeTime = (time) => {
    if (!time) return "09:00:00";
    return time.length === 5 ? `${time}:00` : time;
  };

  const [resveTime, setResveTime] = useState(
    normalizeTime(initialData.visitTime)
  );
  const [name, setName] = useState(initialData.name || "");

  const [tel, setTel] = useState(initialData.tel || "010-");
  const prevTelRef = useRef(tel);

  // tel 상태 변경 시 prevTelRef 업데이트
  useEffect(() => {
    prevTelRef.current = tel;
  }, [tel]);
  const [card, setCard] = useState(initialData.accessCard || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [building, setBuilding] = useState(initialData.visitBuilding || "");

  const formatDateToInput = (value) => {
    if (!value) return "";
    return value.replace(/\./g, "-").replace(/-$/, "").trim();
  };

  const [resveDate, setResveDate] = useState(
    initialData.visitDate ? formatDateToInput(initialData.visitDate) : ""
  );

  const [companyList, setCompanyList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);

  const fetchCompany = async () => {
    try {
      const res = await api.get(`/api/v1/sleep/reserve/company`);
      if (res.data?.success) {
        let data = res.data?.data;

        if (isSecretary) {
          data = data.filter(
            (item) => String(item.companyId) === String(userCompanyId)
          );
        }

        setCompanyList(data);
      }
    } catch (err) {
      console.error("입주사 조회 실패:", err);
      alert(
        extractErrorMessage(
          err,
          "입주사 조회가 실패되었습니다. 다시시도 해주세요."
        )
      );
    }
  };

  const fetchBuilding = async () => {
    try {
      const res = await api.get(`/api/v1/visit/building-list`);
      if (res.data?.success) {
        // console.log(res.data?.data);
        setBuildingList(res.data?.data);
      }
    } catch (err) {
      console.error("동 조회 실패:", err);
      alert(
        err?.response?.data?.message ||
          err?.data?.message ||
          "건물 조회가 실패되었습니다. 다시시도 해주세요."
      );
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchBuilding();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchBuilding();
    }
  }, [companyId]);

  useEffect(() => {
    if (initialData.visitBuilding && buildingList.length > 0) {
      const found = buildingList.find(
        (b) => b.value === initialData.visitBuilding
      );
      if (found) setBuilding(found.code);
      else setBuilding("");
    }
  }, [initialData.visitBuilding, buildingList]);

  useEffect(() => {
    if (initialData.tel) {
      // 기존 전화번호가 010- 형식이 아닌 경우 포맷팅
      const telValue = initialData.tel;
      if (telValue.startsWith("010-")) {
        setTel(telValue);
      } else {
        // 숫자만 추출하여 010- 형식으로 포맷팅
        const numbers = telValue.replace(/[^0-9]/g, "");
        if (numbers.length > 0) {
          const limitedNumbers = numbers.slice(0, 8);
          // 4자리 이상일 때 대시 추가
          if (limitedNumbers.length > 4) {
            const firstPart = limitedNumbers.slice(0, 4);
            const secondPart = limitedNumbers.slice(4, 8);
            setTel(`010-${firstPart}-${secondPart}`);
          } else {
            setTel(`010-${limitedNumbers}`);
          }
        } else {
          setTel("010-");
        }
      }
    }
  }, [initialData.tel]);

  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async () => {
    if (
      !resveDate ||
      !resveTime ||
      !building ||
      !tel ||
      !companyId ||
      !email ||
      !name ||
      !visitNumber
    ) {
      alert("모든 필수 입력 항목을 작성해 주세요.");
      return;
    }

    const normalizePhone = (v) => (v || "").replace(/[^0-9]/g, ""); // 숫자만
    const ensureTel = (v) => (v || "").trim(); // UI 검증 통과했으니 빈문자 방지

    // 추가자가 “완성”되었는지 판정하는 헬퍼
    const isCompleteExtra = (p) =>
      p.name?.trim() &&
      emailRegex.test(p.email || "") &&
      (p.tel || "").trim().length === 13 &&
      (p.tel || "").startsWith("010-") &&
      (p.tel || "").includes("-", 4);

    // 완성된 추가 방문자만 포함
    const validExtras = extraVisitors.filter(isCompleteExtra);

    const members = [
      {
        name: name.trim(),
        email: email.trim(),
        tel: ensureTel(tel),
        // phoneNumber: normalizePhone(tel),
        accessCard: card.trim(),
        sort: 1,
      },
      ...validExtras.map((v, i) => {
        const telStr = ensureTel(v.tel);
        return {
          name: (v.name || "").trim(),
          email: (v.email || "").trim(),
          tel: telStr,
          // phoneNumber: normalizePhone(telStr),
          accessCard: (v.card || "").trim(),
          sort: i + 2,
        };
      }),
    ];

    // const hasBadPhone = members.some((m) => !m.phoneNumber);
    // if (hasBadPhone) {
    //   alert("방문자 연락처가 비어 있습니다. 전화번호를 확인해 주세요.");
    //   return;
    // }

    //  삭제: visitNumber(입력값)와 members.length(실제 전송값) 일치 강제 검사

    // visitNumber와 memberList 개수 동기화 검사
    const memberCount = members.length;
    const visitNum = Number(visitNumber || 0);

    if (!(numVisit >= MIN_VISITORS && numVisit <= MAX_VISITORS)) {
      alert(`방문 인원은 ${MIN_VISITORS}~${MAX_VISITORS}명까지만 가능합니다.`);
      return;
    }

    const payload = {
      companyId: Number(companyId),
      visitDate: resveDate,
      visitTime: resveTime,
      visitBuilding: building,
      visitPurpose: visitPurpose,
      visitNumber: members.length, // 서버 요구: memberList 길이와 동일
      memberList: members,
      ...(isEdit && { id: initialData.id }),
    };

    try {
      const res = await api.post(
        isEdit ? "/api/v1/visit/update" : "/api/v1/visit/insert",
        payload
      );
      if (res.data?.success) {
        alert(extractSuccessMessage(res, isEdit ? "수정 완료" : "등록 완료"));
        onSubmit?.(payload);
        closeModal?.();
      } else {
        alert(extractErrorMessage(res, "처리 실패"));
      }
    } catch (err) {
      console.error("예약 처리 실패:", err);
      alert(
        extractErrorMessage(err, "예약이 실패되었습니다. 다시시도 해주세요.")
      );
    }
  };

  const generateTimeOptions = (startHour, endHour) => {
    const times = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      ["00", "30"].forEach((minute) => {
        times.push(`${String(hour).padStart(2, "0")}:${minute}:00`);
      });
    }
    return times;
  };

  const getReservedTimes = () => {
    return existingReservations
      .filter((r) => r.resource.resveDate === resveDate)
      .map((r) => ({
        start: new Date(`${r.resource.resveDate}T${r.resource.resveTime}`),
        end: new Date(`${r.resource.resveDate}T${r.resource.resveEndTime}`),
      }));
  };

  const isTimeAvailable = (timeStr) => {
    const timeDate = new Date(`${resveDate}T${timeStr}`);
    const reserved = getReservedTimes();

    return reserved.every(({ start, end }) => {
      const beforeStart = new Date(start);
      beforeStart.setHours(beforeStart.getHours() - 1);

      const afterEnd = new Date(end);
      afterEnd.setHours(afterEnd.getHours() + 1);

      return timeDate < beforeStart || timeDate > afterEnd;
    });
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 검사

  const numVisit = Number(visitNumber || 0);
  const visitRangeOk = numVisit >= MIN_VISITORS && numVisit <= MAX_VISITORS;

  const isFormValid =
    companyId &&
    resveDate &&
    resveTime &&
    building &&
    email.trim() !== "" &&
    emailRegex.test(email) &&
    tel.trim() !== "" &&
    tel.length === 13 &&
    tel.startsWith("010-") &&
    tel.includes("-", 4) &&
    visitPurpose.trim() !== "" &&
    name.trim() !== "" &&
    visitNumber &&
    visitRangeOk;

  return (
    <div className="max-h-[80dvh] space-y-5 overflow-y-auto pr-2 text-left">
      {isEdit && (
        <div className="flex w-full gap-4">
          <div className="w-full">
            <label className="mb-1 block">
              예약일시 <span className="text-red-500">*</span>
            </label>
            {initialData?.reservationDatetime}
          </div>

          <div className="w-full">
            <label className="mb-1 block">예약 상태</label>
            <div>{initialData?.status}</div>
          </div>
        </div>
      )}

      <div className="flex w-full gap-4">
        <div className="w-full">
          <label className="mb-1 block">
            방문 날짜 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={resveDate}
              min={getToday()}
              onChange={(e) => {
                const val = e.target.value;
                if (isWeekend(val) || isHoliday(val)) {
                  // alert("주말 및 공휴일은 선택할 수 없습니다.");
                  return;
                }
                setResveDate(val);
              }}
              className="w-full rounded border px-2 py-1"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="mb-1 block">
            방문 시간 <span className="text-red-500">*</span>
          </label>
          <div>
            <select
              value={resveTime}
              onChange={(e) => setResveTime(e.target.value)}
              className="w-full rounded border px-2 py-1"
            >
              <option value="">방문시간을 선택하세요</option>
              {generateTimeOptions(9, 18)
                .filter((time) => time.slice(0, 5) <= "18:00")
                .map((time) => (
                  <option
                    key={time}
                    value={time}
                    disabled={!isTimeAvailable(time)}
                  >
                    {time.slice(0, 5)} {isTimeAvailable(time) ? "" : "(불가)"}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-4">
        <div className="w-full">
          <label className="mb-1 block">
            방문 입주사 <span className="text-red-500">*</span>
          </label>
          <select
            value={companyId}
            onChange={(e) => {
              if (!isSecretary) {
                setCompanyId(e.target.value);
              }
            }}
            disabled={isSecretary}
            className="w-full rounded border px-2 py-1"
            style={{
              backgroundColor: isSecretary ? "#f3f4f6" : "white",
              color: isSecretary ? "#6b7280" : "black",
              cursor: isSecretary ? "not-allowed" : "pointer",
            }}
          >
            {!isSecretary && <option value="">입주사를 선택하세요</option>}
            {companyList.map((r) => (
              <option key={r.companyId} value={r.companyId}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="mb-1 block">
            방문 동 <span className="text-red-500">*</span>
          </label>
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="w-full rounded border px-2 py-1"
          >
            <option value="">방문 동 선택하세요</option>
            {buildingList.map((r) => (
              <option key={r.code} value={r.code}>
                {r.value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full">
        <label className="mb-1 block">
          방문 목적 <span className="text-red-500">*</span>
        </label>
        <input
          value={visitPurpose}
          maxLength={200}
          onChange={(e) => setVisitPurpose(e.target.value)}
          className="w-full rounded border px-2 py-1"
        />
      </div>

      <div className="flex w-full gap-4">
        <div className="w-1/2">
          <label className="mb-1 block">
            방문 인원 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={visitNumber}
            maxLength={2}
            onChange={(e) => {
              // 숫자만 허용
              const raw = e.target.value.replace(/[^\d]/g, "");
              if (raw === "") {
                setVisitNumber("");
                return;
              }
              const num = Math.min(
                MAX_VISITORS,
                Math.max(MIN_VISITORS, parseInt(raw, 10))
              );
              setVisitNumber(String(num));
            }}
            onBlur={() => {
              // 빈값/0 방지: 최소 1로 보정
              if (!visitNumber || Number(visitNumber) < MIN_VISITORS) {
                setVisitNumber(String(MIN_VISITORS));
              }
            }}
            placeholder={`인원 수 (${MIN_VISITORS}~${MAX_VISITORS})`}
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      {Number(visitNumber) >= 2 &&
        (() => {
          const maxExtras = Math.max(
            0,
            Math.min(Number(visitNumber || 0), MAX_VISITORS) - 1
          );
          const canAdd = extraVisitors.length < maxExtras;
          return (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                disabled={!canAdd}
                onClick={() => {
                  if (!canAdd) return;
                  setExtraVisitors((prev) => [
                    ...prev,
                    { name: "", email: "", tel: "010-", card: "" },
                  ]);
                }}
                className={`rounded px-3 py-1 text-white ${canAdd ? "bg-black hover:bg-gray-800" : "cursor-not-allowed bg-gray-400"}`}
              >
                + 방문자 추가
              </button>

              <span className="text-sm text-gray-600">
                추가 가능 인원:{" "}
                {Math.max(
                  0,
                  Math.min(Number(visitNumber || 0), MAX_VISITORS) -
                    1 -
                    extraVisitors.length
                )}
                명
              </span>
            </div>
          );
        })()}

      <div className="flex w-full gap-4">
        <div className="w-full">
          <label className="mb-1 block">
            방문자명 <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            maxLength={50}
            // onChange={(e) => setName(e.target.value)}
            onChange={handleChange}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              // 조합 끝난 값도 정제
              setName(e.target.value.replace(/[^가-힣a-zA-Z0-9\s]/g, ""));
            }}
            className="w-full rounded border px-2 py-1"
          />
        </div>
        <div className="w-full">
          <label className="mb-1 block">
            방문자 이메일 <span className="text-red-500">*</span>
          </label>
          <input
            value={email}
            maxLength={50}
            // onChange={(e) => setEmail(e.target.value)}
            onChange={handleChangeEmail}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              // 조합 끝난 값도 정제
              setEmail(e.target.value.replace(/[^가-힣a-zA-Z0-9@._-]/g, ""));
            }}
            className="w-full rounded border px-2 py-1"
          />
        </div>

        <div className="w-full">
          <label className="mb-1 block">
            방문자 연락처 <span className="text-red-500">*</span>
          </label>
          <input
            value={tel}
            maxLength={13}
            onChange={handleTelChange}
            onKeyDown={(e) => {
              // 010-에서 백스페이스 방지
              if (e.key === "Backspace" && tel === "010-") {
                e.preventDefault();
                return;
              }
            }}
            placeholder="010 뒤 8자리를 입력해 주세요."
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      <div className="w-[50%]">
        <label className="mb-1 block">출입카드 번호</label>
        <input
          value={card}
          maxLength={20}
          onChange={(e) => setCard(e.target.value)}
          className="w-full rounded border px-2 py-1"
        />
      </div>

      {extraVisitors.map((v, idx) => (
        <div key={idx} className="mt-4 rounded-md border p-3">
          <div className="mb-2 font-medium">추가 방문자 #{idx + 2}</div>

          <div className="flex w-full gap-4">
            <div className="w-full">
              <label className="mb-1 block">방문자명</label>
              <input
                value={v.name}
                maxLength={50}
                onChange={(e) =>
                  updateExtra(idx, {
                    name: e.target.value.replace(/[^가-힣a-zA-Z0-9\s]/g, ""),
                  })
                }
                className="w-full rounded border px-2 py-1"
              />
            </div>

            <div className="w-full">
              <label className="mb-1 block">방문자 이메일</label>
              <input
                value={v.email}
                maxLength={50}
                onChange={(e) =>
                  updateExtra(idx, {
                    email: e.target.value.replace(/[^가-힣a-zA-Z0-9@._-]/g, ""),
                  })
                }
                className="w-full rounded border px-2 py-1"
              />
            </div>

            <div className="w-full">
              <label className="mb-1 block">방문자 연락처</label>
              <input
                value={v.tel}
                maxLength={13}
                onChange={(e) =>
                  updateExtra(idx, { tel: formatTel010(e.target.value) })
                }
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && v.tel === "010-")
                    e.preventDefault();
                }}
                placeholder="010 뒤 8자리를 입력해 주세요."
                className="w-full rounded border px-2 py-1"
              />
            </div>
          </div>

          <div className="mt-2 w-[50%]">
            <label className="mb-1 block">출입카드 번호</label>
            <input
              value={v.card}
              maxLength={20}
              onChange={(e) => updateExtra(idx, { card: e.target.value })}
              className="w-full rounded border px-2 py-1"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setExtraVisitors((prev) => prev.filter((_, i) => i !== idx))
              }
              className="rounded border px-3 py-1 hover:bg-gray-50"
            >
              삭제
            </button>
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 z-10 flex justify-center gap-3 border-t bg-white pt-3">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`cursor-pointer rounded px-4 py-2 text-white ${
            isFormValid
              ? "bg-black hover:bg-gray-800"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          저장
        </button>
      </div>
    </div>
  );
}
