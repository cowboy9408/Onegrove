import NewInput from "@/components/common/NewInput";
import Radio from "@/components/common/Radio";
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";

export default function UserDetailModal({ userData }) {
  const data = userData || {
    companyName: "",
    isActive: true,
    office: "",
    floor: "",
    representativeName: "",
    phoneNumber: "",
    email: "",
    imageUrl: "",
    secretaries: [],
    freeAmenityHours: 0,
    thisMonthUsage: 0,
    freeUsedHours: 0,
    paidUsedHours: 0,
  };

  const [freeUsedHours, setFreeUsedHours] = useState(0);
  const [paidUsedHours, setPaidUsedHours] = useState(0);

  useEffect(() => {
    const companyId = data.companyId; // 또는 props로 넘겨주신 값

    const fetchUsageTime = async () => {
      try {
        const [resFree, resPaid] = await Promise.all([
          api.get(
            `/api/v1/company/detail/time?companyId=${companyId}&type=free`
          ),
          api.get(
            `/api/v1/company/detail/time?companyId=${companyId}&type=paid`
          ),
        ]);

        setFreeUsedHours(resFree.data?.data ?? 0);
        setPaidUsedHours(resPaid.data?.data ?? 0);
      } catch (err) {
        console.error("월별 어메니티 시간 조회 실패:", err);
        setFreeUsedHours(0);
        setPaidUsedHours(0);
      }
    };

    if (companyId) {
      fetchUsageTime();
    }
  }, [data.companyId]);

  return (
    <div className="space-y-5 text-left">
      <h2 className="text-lg font-bold"></h2>

      {/* 입주사 명 */}
      <NewInput
        id="companyName"
        label="입주사 명"
        value={data.companyName}
        readOnly
      />

      {/* 사용 여부 */}
      <div className="flex items-center gap-6">
        <span className="min-w-[100px] text-sm font-medium text-gray-800">
          사용 여부
        </span>
        <Radio
          id="active"
          name="isActive"
          label="사용"
          value="Y"
          checked={data.isActive}
          onChange={() => {}}
          disabled
        />
        <Radio
          id="inactive"
          name="isActive"
          label="미사용"
          value="N"
          checked={!data.isActive}
          onChange={() => {}}
          disabled
        />
      </div>

      {/* 오피스 / 층수 */}
      <div className="flex w-full flex-wrap gap-4">
        <div className="min-w-[100px] flex-1">
          <NewInput id="office" label="오피스" value={data.office} readOnly />
        </div>
        <div className="w-[180px]">
          <NewInput id="floor" label="층" value={data.floor} readOnly />
        </div>
      </div>

      {/* 대표명 / 전화번호 / 이메일 */}
      <NewInput
        id="representativeName"
        label="대표명"
        value={data.representativeName}
        readOnly
      />
      <NewInput
        id="phoneNumber"
        label="전화번호"
        value={data.phoneNumber}
        readOnly
      />
      <NewInput id="email" label="대표 이메일" value={data.email} readOnly />

      {/* 대표 이미지 */}
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-800">
          대표 이미지
        </span>
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt="대표 이미지"
            className="h-24 w-24 rounded border"
          />
        ) : (
          <div className="text-sm text-gray-400">이미지가 없습니다</div>
        )}
      </div>

      {/* 총무 담당자 목록 */}
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-800">
          총무 담당자 목록
        </span>
        {data.secretaries?.length > 0 ? (
          <ul className="list-inside list-disc text-sm text-gray-700">
            {data.secretaries.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-400">총무 담당자가 없습니다.</div>
        )}
      </div>

      {/* 어메니티 예약 정보 */}
      <div className="space-y-1 text-sm">
        <div className="font-medium text-gray-800">
          어메니티 예약 무료 시간: {data.freeAmenityHours}시간
        </div>
        <div className="font-medium text-gray-800">
          이번 달 어메니티 예약 사용 시간
        </div>
        <div className="mt-2 font-medium text-gray-800">
          무료 사용 시간: {freeUsedHours}시간 / 유료 사용 시간: {paidUsedHours}
          시간
        </div>
      </div>
    </div>
  );
}
