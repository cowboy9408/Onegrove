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
import VisitForm from "@/components/modal/VisitForm";
import api from "@/lib/apiClient";
import { useSearchParams } from "react-router-dom";

export default function Visit() {
  const { showModal } = useContext(ModalContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [total, setTotal] = useState(0);
  const [visitList, setVisitList] = useState([]);
  const [searchFilter, setSearchFilter] = useState({
    companyId: "",
    status: "",
    dateRange: { startDate: null, endDate: null },
    building: "",
    cardNumber: "",
    visitorName: "",
  });
  const [activeFilter, setActiveFilter] = useState(searchFilter);
  const [companyList, setCompanyList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const size = 30;

  const getCompanyNameById = (id) => {
    const found = companyList.find((c) => String(c.companyId) === String(id));
    return found?.companyName ?? "";
  };

  const getBuildingNameByCode = (code) => {
    const found = buildingList.find((b) => b.code === code);
    return found?.value ?? "";
  };

  const getStatusValueByCode = (code) => {
    const found = statusList.find((s) => s.code === code);
    return found?.value ?? "";
  };

  const handleSearch = () => {
    console.log("API 검색 파라미터:", {
      companyName: getCompanyNameById(searchFilter.companyId),
      visitBuilding: getBuildingNameByCode(searchFilter.building),
      status: searchFilter.status,
    });
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
      const res = await api.get("/api/v1/visit");

      if (res.data?.success && Array.isArray(res.data.data)) {
        setVisitList(res.data.data); // 전체 데이터 저장
        setTotal(res.data.data.length);
      }
    } catch (err) {
      console.error("목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchVisitCategoryData(); // 하나로 통합된 호출
  }, []);

  const filteredList = visitList.filter((item) => {
    const matchesCompany =
      !activeFilter.companyId ||
      getCompanyNameById(activeFilter.companyId) === item.companyName;

    const matchesBuilding =
      !activeFilter.building ||
      getBuildingNameByCode(activeFilter.building) === item.visitBuilding;

    const matchesStatus =
      !activeFilter.status ||
      getStatusValueByCode(activeFilter.status) === item.status;

    const matchesVisitor =
      !activeFilter.visitorName ||
      item.name?.includes(activeFilter.visitorName);

    const matchesCard =
      !activeFilter.cardNumber ||
      (activeFilter.cardNumber.length >= 3 &&
        item.accessCard?.includes(activeFilter.cardNumber));

    const matchesDate = (() => {
      const visitDate = new Date(item.visitDate);
      const start = activeFilter.dateRange.startDate
        ? new Date(activeFilter.dateRange.startDate)
        : null;
      const end = activeFilter.dateRange.endDate
        ? new Date(activeFilter.dateRange.endDate)
        : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      if (start && end) return visitDate >= start && visitDate <= end;
      if (start) return visitDate >= start;
      if (end) return visitDate <= end;

      return true; // 날짜 선택 안 했을 경우
    })();

    return (
      matchesCompany &&
      matchesBuilding &&
      matchesStatus &&
      matchesVisitor &&
      matchesCard &&
      matchesDate
    );
  });

  useEffect(() => {
    fetchList();
  }, [activeFilter]);

  const handleEventClick = async (event) => {
    try {
      const res = await api.get(`/api/v1/visit/detail/${event}`);
      if (!res.data.success) return;
      const detail = res.data.data;
      console.log("상세 데이터:", detail);

      showModal({
        title: "방문 예약 상세",
        size: "2xl",
        customButton: true,
        showCancel: true,
        children: ({ closeModal }) => (
          <div className="space-y-5 text-sm text-gray-700">
            <table className="w-full border text-left">
              <tbody>
                <tr>
                  <th className="border p-2">예약일시</th>
                  <td className="border p-2">{detail.reservationDatetime}</td>
                  <th className="border p-2">예약 상태</th>
                  <td
                    className={`border p-2 ${detail.status === "예약 확정" ? "text-[#00AAFF]" : "text-[#4CAF50]"} font-bold`}
                  >
                    {detail.status}
                  </td>
                </tr>
                <tr>
                  <th className="min-w-[80px] border p-2">방문 날짜</th>
                  <td className="border p-2">{detail.visitDate}</td>
                  <th className="border p-2">방문 시간</th>
                  <td className="border p-2">{detail.visitTime}</td>
                </tr>
                <tr>
                  <th className="border p-2">방문 입주사</th>
                  <td className="border p-2">{detail.companyName}</td>
                  <th className="border p-2">방문 동</th>
                  <td className="border p-2">{detail.visitBuilding}</td>
                </tr>
                <tr>
                  <th className="border p-2">방문 목적</th>
                  <td className="h-[80px] border p-2 break-all" colSpan={3}>
                    {detail.visitPurpose}
                  </td>
                </tr>
                <tr>
                  <th className="border p-2">방문자명</th>
                  <td className="border p-2">{detail.name}</td>
                  <th className="border p-2">방문 인원</th>
                  <td className="border p-2">{detail.visitNumber}</td>
                </tr>
                <tr>
                  <th className="border p-2">방문자 이메일</th>
                  <td className="border p-2">{detail.email}</td>
                  <th className="border p-2">방문자 연락처</th>
                  <td className="border p-2">{detail.tel}</td>
                </tr>
                <tr>
                  <th className="border p-2">출입카드 번호</th>
                  <td className="border p-2">{detail.accessCard}</td>
                  <th className="border p-2"></th>
                  <td className="border p-2"></td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                {detail.status === "가예약" && (
                  <Button
                    theme="danger"
                    onClick={async () => {
                      if (confirm("예약을 확정하겠습니까?")) {
                        try {
                          const res = await api.post("/api/v1/visit/confirm", {
                            checkArr: [detail.id],
                          });
                          if (res.data?.success) {
                            alert("예약 확정 완료");
                            fetchList();
                            closeModal();
                          } else alert("예약 확정 실패");
                        } catch (err) {
                          console.error("예약 확정 오류:", err);
                          alert(
                            err?.response?.data?.message ||
                              err?.data?.message ||
                              "예약 확정이 실패되었습니다. 다시시도 해주세요."
                          );
                        }
                      }
                    }}
                  >
                    예약 확정
                  </Button>
                )}

                {detail.status !== "예약 취소" && (
                  <Button
                    theme="danger"
                    onClick={async () => {
                      if (confirm("예약을 취소하겠습니까?")) {
                        try {
                          const res = await api.post("/api/v1/visit/cancel", {
                            id: detail.id,
                            companyId: detail.companyId,
                            tel: detail.tel,
                          });
                          if (res.data?.success) {
                            alert("취소 완료");
                            fetchList();
                            closeModal();
                          } else alert("취소 실패");
                        } catch (err) {
                          console.error("취소 오류:", err);
                          alert(
                            err?.response?.data?.message ||
                              err?.data?.message ||
                              "예약 취소가 실패되었습니다. 다시시도 해주세요."
                          );
                        }
                      }
                    }}
                  >
                    예약 취소
                  </Button>
                )}
              </div>
              <div>
                <Button
                  onClick={() => {
                    closeModal();
                    showModify(detail);
                  }}
                >
                  수정
                </Button>
              </div>
            </div>
          </div>
        ),
      });
    } catch (err) {
      console.error("상세 조회 실패:", err);
    }
  };

  const showInput = (detail) => {
    showModal({
      title: "방문 예약 수정",
      size: "2xl",
      customButton: true,
      showCancel: true,
      children: ({ closeModal }) => (
        <VisitForm
          initialData={detail}
          closeModal={closeModal}
          onSubmit={() => {
            fetchList();
            closeModal();
          }}
        />
      ),
    });
  };

  const showModify = (detail) => {
    showModal({
      title: "방문 예약 수정",
      size: "2xl",
      customButton: true,
      showCancel: true,
      children: ({ closeModal }) => (
        <VisitForm
          isEdit
          initialData={detail}
          closeModal={closeModal}
          onSubmit={() => {
            fetchList();
            closeModal();
          }}
        />
      ),
    });
  };

  return (
    <div>
      <SearchSection>
        <Box>
          <div className="flex flex-col gap-6">
            {/* 첫 줄: 입주사, 상태, 등록일 */}
            <div className="flex gap-6">
              <div className="min-w-[200px] flex-1">
                <Select
                  label="입주사"
                  value={searchFilter.companyId}
                  onChange={(e) =>
                    setSearchFilter({
                      ...searchFilter,
                      companyId: e.target.value,
                    })
                  }
                >
                  <option value="">전체</option>
                  {companyList.map((c) => (
                    <option key={c.companyId} value={c.companyId}>
                      {c.companyName}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="min-w-[200px] flex-1">
                <Select
                  label="상태"
                  value={searchFilter.status}
                  onChange={(e) =>
                    setSearchFilter({ ...searchFilter, status: e.target.value })
                  }
                >
                  <option value="">전체</option>
                  {statusList.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.value}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="min-w-[300px] flex-1">
                <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                  방문 신청일
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
            </div>

            {/* 둘째 줄: 방문동, 카드번호, 방문객 */}
            <div className="flex gap-6">
              <div className="min-w-[200px] flex-1">
                <Select
                  label="방문동"
                  value={searchFilter.building}
                  onChange={(e) =>
                    setSearchFilter({
                      ...searchFilter,
                      building: e.target.value,
                    })
                  }
                >
                  <option value="">전체</option>
                  {buildingList.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.value}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="min-w-[200px] flex-1">
                <Input
                  label="카드 번호"
                  value={searchFilter.cardNumber}
                  onChange={(e) =>
                    setSearchFilter({
                      ...searchFilter,
                      cardNumber: e.target.value,
                    })
                  }
                  onClear={() =>
                    setSearchFilter({ ...searchFilter, cardNumber: "" })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="예: 123 (3자리 이상 입력 시 검색 가능)"
                />
              </div>

              <div className="min-w-[200px] flex-1">
                <Input
                  label="방문객"
                  value={searchFilter.visitorName}
                  onChange={(e) =>
                    setSearchFilter({
                      ...searchFilter,
                      visitorName: e.target.value,
                    })
                  }
                  onClear={() =>
                    setSearchFilter({ ...searchFilter, visitorName: "" })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
              </div>
            </div>

            {/* 버튼 줄 */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleSearch}>검색</Button>

              <Button
                variant="outline"
                onClick={() => {
                  const defaultFilter = {
                    companyId: "",
                    status: "",
                    dateRange: { startDate: null, endDate: null },
                    building: "",
                    cardNumber: "",
                    visitorName: "",
                  };

                  setSearchFilter(defaultFilter);
                  setActiveFilter(defaultFilter);
                  setPage(1);
                  setSearchParams({ page: 1 });
                  fetchList();
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
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              showInput({
                id: null,
                reservationDatetime: null,
                status: null,
                visitDate: null,
                visitTime: null,
                companyId: null,
                companyName: null,
                visitBuilding: null,
                visitPurpose: null,
                name: null,
                visitNumber: null,
                email: null,
                tel: null,
                accessCard: null,
              });
            }}
          >
            방문객 추가
          </Button>
        </div>
      </div>

      <ResultSection>
        <DataTableSimple
          columns={[
            { key: "rownum", label: "번호" },
            { key: "companyName", label: "입주사" },
            { key: "name", label: "방문객" },
            {
              key: "visitPurpose",
              label: "방문 목적",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <button
                    className={`text-black-600 cursor-pointer truncate p-2 text-left ${row.visitPurpose && "underline"}`}
                    onClick={(e) => {
                      e.preventDefault();

                      handleEventClick(row.id);
                    }}
                  >
                    {row.visitPurpose}
                  </button>
                </div>
              ),
            },
            { key: "visitDate", label: "방문 신청일" },
            { key: "visitTime", label: "방문 시간" },
            { key: "visitNumber", label: "방문 인원" },
            { key: "visitBuilding", label: "방문동" },
            { key: "accessCard", label: "카드번호" },
            { key: "createDatetime", label: "등록일시" },
            { key: "status", label: "상태" },
          ]}
          data={filteredList.slice((page - 1) * size, page * size)}
          rowKey="id"
          checkable={true}
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
