import React, { useState, useEffect } from "react";
import api from "@/lib/apiClient";

export default function VisitForm({
  existingReservations = [],
  initialData = {},
  isEdit = false,
  onSubmit,
  closeModal,
}) {
  const [companyId, setCompanyId] = useState(isEdit ? initialData.companyId || "" : "");
  const [visitNumber, setVisitNumber] = useState(isEdit ? initialData.visitNumber || "" : "");
  const [visitPurpose, setVisitPurpose] = useState(isEdit ? initialData.visitPurpose || "" : "");
  const [resveDate, setResveDate] = useState(initialData.visitDate || "");
  const [resveTime, setResveTime] = useState(initialData.resveTime || "09:00:00");
  const [name, setName] = useState(initialData.name || "");
  
  const [tel, setTel] = useState(initialData.tel || "");
  const [card, setCard] = useState( initialData.accessCard || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [building, setBuilding] = useState(initialData.visitBuilding || "");


  
  const [companyList, setCompanyList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);


  console.log(initialData);

  const fetchCompany = async () => {
    try {
      const res = await api.get(`/api/v1/sleep/reserve/company`);
      if (res.data?.success) {
        console.log(res.data?.data);
        setCompanyList(res.data?.data);
      }
    } catch (err) {
      console.error("입주사 조회 실패:", err);
    }
  };

  const fetchBuilding = async () => {
    try {
      const res = await api.get(`/api/v1/visit/building-list`);
      if (res.data?.success) {
        console.log(res.data?.data);
        setBuildingList(res.data?.data);
      }
    } catch (err) {
      console.error("동 조회 실패:", err);
    }
  };



  useEffect(() => {
    fetchCompany();
    fetchBuilding();
  }, []);

  useEffect(() => {
    if ( companyId ) {
      fetchBuilding();
    }
    
  }, [companyId]);


  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async () => {
    if (
      !resveDate ||
      !resveTime ||
      !tel ||
      !companyId
    ) {
      alert("모든 필수 입력 항목을 작성해 주세요.");
      return;
    }

    const payload = {
      companyId: companyId,
      visitDate: resveDate,
      visitTime: resveTime,
      visitBuilding: building,
      visitPurpose: visitPurpose,
      email: email,
      name: name,
      tel: tel,
      visitNumber: Number(visitNumber),
      ...(isEdit && { id: initialData.id }),
    };

// {
//     "companyId": 3,
//     "visitDate": "2025-06-25",
//     "visitTime": "12:00:00",
//     "visitBuilding": "cp0101",
//     "visitPurpose": "방문 목적",
//     "name": "방문자명",
//     "visitNumber": 5,
//     "email": "test@test.kr",
//     "tel": "010-1234-5678"
// }

    try {
      const res = await api.post(
        isEdit ? "/api/v1/visit/update" : "/api/v1/visit/insert",
        payload
      );
      if (res.data?.success) {
        alert(isEdit ? "수정 완료" : "등록 완료");
        onSubmit?.(payload);
        closeModal?.();
      } else alert("처리 실패");
    } catch (err) {
      console.error("예약 처리 실패:", err);
      alert(err?.respopnse?.data?.message);
      // alert("필수 입력 내용을 확인해 주세요.");
    }
  };


  const generateTimeOptions = (startHour, endHour) => {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return `${String(hour).padStart(2, '0')}:00:00`;
    });
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

  const isFormValid =
    companyId &&
    resveDate &&
    resveTime &&
    tel &&
    visitNumber;


  return (
    <div className="space-y-5 text-left">

        

      <div className="flex gap-4 w-full">
        <div className="w-full">
          <label className="block mb-1">예약일시 <span className="text-red-500">*</span></label>
          {initialData?.reservationDatetime}
        </div>

        <div className="w-full">
          <label className="block mb-1">예약 상태</label>
          <div>{initialData?.status}</div>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <div className="w-full">
          <label className="block mb-1">방문 날짜 <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input type="date" value={resveDate} min={getToday()} onChange={(e) => setResveDate(e.target.value)} className="border px-2 py-1 rounded w-full" />
          </div>
        </div>

        <div className="w-full">
          <label className="block mb-1">방문 시간 <span className="text-red-500">*</span></label>
          <div>
            <select value={resveTime} onChange={(e) => setResveTime(e.target.value)} className="border px-2 py-1 rounded w-full">
              {generateTimeOptions(9, 17).map((time) => (
                <option key={time} value={time} disabled={!isTimeAvailable(time)}>
                  {time.slice(0, 5)} {isTimeAvailable(time) ? "" : "(불가)"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <div className="w-full">
          <label className="block mb-1">방문 입주사 <span className="text-red-500">*</span></label>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}
            className="w-full border px-2 py-1 rounded"  
          >
            <option value="">입주사를 선택하세요</option>
            {companyList.map((r) => (
              <option key={r.companyId} value={r.companyId}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block mb-1">방문 동 <span className="text-red-500">*</span></label>
          <select value={building} onChange={(e) => setBuilding(e.target.value)}
            className="w-full border px-2 py-1 rounded"  
          >
            <option value="">방문 동 선택하세요</option>
            {buildingList.map((r) => (
              <option key={r.code} value={r.value}>
                {r.value}
              </option>
            ))}
            
          </select>
        </div>
      </div>

      <div className="w-full">
        <label className="block mb-1">방문 목적 <span className="text-red-500">*</span></label>
        <input value={visitPurpose} onChange={(e) => setVisitPurpose(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>

      <div className="flex gap-4 w-full">
        <div className="w-full">
          <label className="block mb-1">방문자명 <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-2 py-1 rounded" />
        </div>

        
        <div className="w-full">
          <label className="block mb-1">방문 인원 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={visitNumber}
            maxLength={2}
            onChange={(e) => {
              const input = e.target.value;
              if (input === "") {
                setVisitNumber("");
                return;
              }
              if (!/^\d+$/.test(input)) return;
            }}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <div className="w-full">
          <label className="block mb-1">방문자 이메일 <span className="text-red-500">*</span></label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-2 py-1 rounded" />
        </div>


      
        <div className="w-full">
          <label className="block mb-1">방문자 연락처 <span className="text-red-500">*</span></label>
          <input value={tel} onChange={(e) => setTel(e.target.value)} className="w-full border px-2 py-1 rounded" />
        </div>
      </div>


      

      <div className="w-[50%]">
        <label className="block mb-1">출입카드 번호</label>
        <input value={card} onChange={(e) => setCard(e.target.value)} className="w-full border px-2 py-1 rounded" disabled={true} />
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`rounded px-4 py-2 cursor-pointer text-white ${
            isFormValid ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          저장
        </button>
        <button
          onClick={closeModal}
          className="rounded border px-4 py-2 cursor-pointer"
        >
          취소
        </button>
      </div>
    </div>
  );
}