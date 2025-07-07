import { useEffect, useState, useContext } from "react";
import Button from "@/components/common/Button";
import DataTableSimple from "@/components/common/DataTableSimple";
import Input from "@/components/common/Input";
import Pagination from "@/components/common/Pagination";
import ResultSummary from "@/components/common/ResultSummary";
import Select from "@/components/common/Select";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import ResultSection from "@/components/layout/ResultSection";
import Row from "@/components/layout/Row";
import SearchSection from "@/components/layout/SearchSection";
import { ModalContext } from "@/context/ModalContext";
import DateRangePicker from "@/components/common/Datepicker";

import api from "@/lib/apiClient";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Visit() {
  const { showModal } = useContext(ModalContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [visitList, setVisitList] = useState([]);
  const [searchFilter, setSearchFilter] = useState({
    meetingRoom: "",
    companyName: "",
    paymentType: "", // "무료", "유료"
    status: "", // "가예약", "예약 확정", "예약 취소"
    dateRange: { startDate: null, endDate: null },
  });

  const [activeFilter, setActiveFilter] = useState(searchFilter);
  const [companyList, setCompanyList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const size = 30;

  const handleSearch = () => {
    setPage(1);
    setSearchParams({ page: 1 });
    setActiveFilter(searchFilter);
  };

  const fetchVisitCategoryData = async () => {
    try {
      const res = await api.get("/api/v1/visit/category");

      if (res.data?.success) {
        const {
          visitCompanyListRes,
          visitStatusListRes,
          visitBuildingListRes,
        } = res.data.data;

        if (Array.isArray(visitCompanyListRes)) {
          setCompanyList(visitCompanyListRes);
        }
        if (Array.isArray(visitStatusListRes)) {
          setStatusList(visitStatusListRes);
        }
        if (Array.isArray(visitBuildingListRes)) {
          setBuildingList(visitBuildingListRes);
        }
      }
    } catch (err) {
      console.error("방문 카테고리 데이터 불러오기 실패:", err);
    }
  };

  const fetchList = async () => {
    try {
      const res = await api.get("/api/v1/meeting/history");

      if (res.data?.success && Array.isArray(res.data.data)) {
        setVisitList(res.data.data);
        setTotal(res.data.data.length);
      }
    } catch (err) {
      console.error("회의실 예약 이력 불러오기 실패:", err);
    }
  };

  const downloadExcel = async () => {
    try {
      const res = await api.get(
        "/api/v1/meeting?export=excel&roomId=0&isVip=false",
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-");
      a.download = `회의실_예약_이력_${timestamp}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("엑셀 다운로드 실패:", err);
      alert("엑셀 다운로드에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchVisitCategoryData(); // 하나로 통합된 호출
  }, []);

  const filteredList = visitList.filter((item) => {
    const matchesRoom =
      !activeFilter.meetingRoom ||
      item.meetingRoom === activeFilter.meetingRoom;

    const matchesCompany =
      !activeFilter.companyName ||
      item.companyName === activeFilter.companyName;

    const matchesPayment =
      !activeFilter.paymentType ||
      item.paymentType === activeFilter.paymentType;

    const matchesStatus =
      !activeFilter.status || item.status === activeFilter.status;

    const matchesDate =
      !activeFilter.dateRange.startDate ||
      !activeFilter.dateRange.endDate ||
      (new Date(item.createDatetime) >= activeFilter.dateRange.startDate &&
        new Date(item.createDatetime) <= activeFilter.dateRange.endDate);

    return (
      matchesRoom &&
      matchesCompany &&
      matchesPayment &&
      matchesStatus &&
      matchesDate
    );
  });

  useEffect(() => {
    fetchList();
  }, [activeFilter]);

  const meetingRoomList = [
    ...new Set(visitList.map((item) => item.meetingRoom)),
  ];

  return (
    <div>
      <SearchSection>
        <Box>
          <div className="flex flex-col gap-6">
            {/* 1줄: Meeting Room, 입주사, 예약 종류 */}
            <div className="flex items-end gap-6">
              <div className="min-w-[200px] flex-1">
                <Select
                  label="Meeting Room"
                  value={searchFilter.meetingRoom}
                  onChange={(e) =>
                    setSearchFilter({
                      ...searchFilter,
                      meetingRoom: e.target.value,
                    })
                  }
                >
                  <option value="">전체</option>
                  {meetingRoomList.map((room, idx) => (
                    <option key={idx} value={room}>
                      {room}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="min-w-[200px] flex-1">
                <Select
                  label="입주사"
                  value={searchFilter.companyName}
                  onChange={(e) =>
                    setSearchFilter({
                      ...searchFilter,
                      companyName: e.target.value,
                    })
                  }
                >
                  <option value="">전체</option>
                  {companyList.map((c) => (
                    <option key={c.companyId} value={c.companyName}>
                      {c.companyName}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                  예약 종류
                </label>
                <div className="flex gap-4">
                  {["", "무료", "유료"].map((type) => (
                    <label key={type} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="paymentType"
                        value={type}
                        checked={searchFilter.paymentType === type}
                        onChange={(e) =>
                          setSearchFilter({
                            ...searchFilter,
                            paymentType: e.target.value,
                          })
                        }
                      />
                      <span>{type === "" ? "전체" : type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 2줄: 예약 일정, 예약 상태 */}
            <div className="flex items-end gap-6">
              <div className="min-w-[300px] flex-1">
                <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                  예약 일정
                </p>
                <DateRangePicker
                  startDate={searchFilter.dateRange.startDate}
                  endDate={searchFilter.dateRange.endDate}
                  onRangeChange={({ startDate, endDate }) =>
                    setSearchFilter({
                      ...searchFilter,
                      dateRange: { startDate, endDate },
                    })
                  }
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                  예약 상태
                </label>
                <div className="flex gap-4">
                  {["", "가예약", "예약 확정", "예약 취소"].map((status) => (
                    <label key={status} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={searchFilter.status === status}
                        onChange={(e) =>
                          setSearchFilter({
                            ...searchFilter,
                            status: e.target.value,
                          })
                        }
                      />
                      <span>{status === "" ? "전체" : status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleSearch}>검색</Button>
              <Button
                variant="outline"
                onClick={() => {
                  const defaultFilter = {
                    meetingRoom: "",
                    companyName: "",
                    paymentType: "",
                    status: "",
                    dateRange: { startDate: null, endDate: null },
                  };
                  setSearchFilter(defaultFilter);
                  setActiveFilter(defaultFilter);
                  setPage(1);
                  setSearchParams({ page: 1 });
                }}
              >
                초기화
              </Button>
            </div>
          </div>
        </Box>
      </SearchSection>

      <div className="mb-4 flex items-center justify-between">
        <ResultSummary total={filteredList.length} />

        <div className="flex gap-2">
          <Button onClick={downloadExcel}>엑셀 다운로드</Button>
        </div>
      </div>

      <ResultSection>
        <DataTableSimple
          columns={[
            { key: "rownum", label: "번호" },
            { key: "meetingRoom", label: "회의실" },
            { key: "companyName", label: "입주사" },
            { key: "paymentType", label: "결제 유형" },
            { key: "resvDatetime", label: "예약 일정" },
            { key: "freeStackTime", label: "누적 무료 시간" },
            { key: "paidStackTime", label: "누적 유료 시간" },
            { key: "status", label: "예약 상태" },
            { key: "createDatetime", label: "등록일시" },
            { key: "createUser", label: "등록자" },
          ]}
          data={filteredList.slice((page - 1) * size, page * size)}
          rowKey="rownum"
        />

        <Pagination
          current={page}
          totalPages={Math.ceil(filteredList.length / size)}
          onChange={(page) => setPage(page)}
        />
      </ResultSection>
    </div>
  );
}
