import Button from "@/components/common/Button";
import DataTable from "@/components/common/DataTable";
import Input from "@/components/common/Input";
import Pagination from "@/components/common/Pagination";
import ResultSummary from "@/components/common/ResultSummary";
import Select from "@/components/common/Select";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import ResultSection from "@/components/layout/ResultSection";
import Row from "@/components/layout/Row";
import SearchSection from "@/components/layout/SearchSection";
import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Radio from "@/components/common/Radio";
import api from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import useModal from "@/hooks/useModal";

export default function PermissionList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { permission, companyId } = useAuthStore(); // 로그인된 사용자의 역할(role) 가져오기
  const { showModal } = useModal();
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [checkedIds, setCheckedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [companyOptions, setCompanyOptions] = useState([]);
  const defaultFilter = {
    name: "",
    email: "",
    status: "",
    type: "",
  };
  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);
  const [updating, setUpdating] = useState(false);

  const nameId = useId();
  const emailId = useId();

  const size = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/v1/user/wait-member");
        const res = response.data;

        if (res.success) {
          let allData = res.data;

          console.log(allData.map((v) => v.companyName));

          if (permission === "OFFICE_SECRETARY_ADMIN") {
            const myCompanyName = allData[0]?.companyName;
            if (myCompanyName) {
              setSearchFilter((prev) => ({ ...prev, type: myCompanyName }));
              setActiveFilter((prev) => ({ ...prev, type: myCompanyName }));
              setCompanyOptions([
                { companyId: null, companyName: myCompanyName },
              ]);
            }
          } else {
            // 관리자일 경우 전체 회사 옵션 구성
            const uniqueCompanies = Array.from(
              new Map(allData.map((item) => [item.companyName, item])).values()
            );
            setCompanyOptions(uniqueCompanies);
          }

          // 이후 필터 처리
        }
      } catch (error) {
        console.error("API 요청 실패:", error);
      }
    };

    fetchData();
  }, [page, refreshKey]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  };

  const handleUpdateStatusDo = async (status /* 'Y' | 'N' */) => {
    const verb = status === "Y" ? "승인" : "거절";
    try {
      setUpdating(true);
      // 선택 ID 정규화(문자→숫자)
      const checkArr = checkedIds
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v));

      const res = await api.post("/api/v1/user/wait-member/update", {
        checkArr,
        status,
      });
      const ok =
        res?.data?.success ?? (res?.status >= 200 && res?.status < 300);

      if (ok) {
        showModal({
          title: "완료",
          message: `${verb}이 완료되었습니다.`,
          confirmButton: "확인",
        });
        setCheckedIds([]);
        setPage(1);
        setRefreshKey((prev) => prev + 1);
      } else {
        showModal({
          title: "오류",
          message: `${verb} 실패: 서버 오류`,
          confirmButton: "확인",
        });
      }
    } catch (err) {
      console.error(`${verb} 요청 실패:`, err);
      showModal({
        title: "에러",
        message: `${verb} 중 오류가 발생했습니다.`,
        confirmButton: "확인",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleClickApprove = () => {
    if (!checkedIds?.length) {
      showModal({
        title: "알림",
        message: "승인할 항목을 선택해주세요.",
        confirmButton: "확인",
      });
      return;
    }
    showModal({
      title: "승인 확인",
      message: "선택한 회원을 승인하시겠습니까?",
      showCancel: true,
      confirmButton: "승인",
      onConfirm: () => handleUpdateStatusDo("Y"),
    });
  };

  const handleClickReject = () => {
    if (!checkedIds?.length) {
      showModal({
        title: "알림",
        message: "거절할 항목을 선택해주세요.",
        confirmButton: "확인",
      });
      return;
    }
    showModal({
      title: "거절 확인",
      message: "선택한 회원을 거절하시겠습니까?",
      showCancel: true,
      confirmButton: "거절",
      onConfirm: () => handleUpdateStatusDo("N"),
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/v1/user/wait-member");
        const res = response.data;

        if (res.success) {
          let allData = res.data;

          console.log(allData.map((item) => item.isUse));

          let filtered = allData;

          if (
            permission === "OFFICE_SECRETARY_ADMIN" &&
            companyId &&
            filtered.some((i) => i.companyId != null)
          ) {
            filtered = filtered.filter(
              (item) => String(item.companyId) === String(companyId)
            );
          }

          filtered.sort((a, b) => {
            const dateA = new Date(a.createDatetime);
            const dateB = new Date(b.createDatetime);
            return dateB - dateA;
          });

          if (activeFilter.type) {
            filtered = filtered.filter(
              (item) => item.companyName === activeFilter.type
            );
          }

          if (activeFilter.name) {
            filtered = filtered.filter((item) =>
              item.name?.includes(activeFilter.name)
            );
          }

          if (activeFilter.email) {
            filtered = filtered.filter((item) =>
              item.userName?.includes(activeFilter.email)
            );
          }

          if (activeFilter.status) {
            filtered = filtered.filter(
              (item) => item.status === activeFilter.status
            );
          }

          // 페이지네이션 처리
          const startIndex = (page - 1) * size;
          const paginated = filtered.slice(startIndex, startIndex + size);
          const totalFiltered = filtered.length;

          // 데이터 형식을 맞춰서 상태에 저장
          setData(
            paginated.map((item, index) => ({
              no: totalFiltered - (startIndex + index),
              _id: item.id, // 체크박스 선택용 PK (DataTable이 _id를 쓴다면 유지)
              companyName: item.companyName,
              name: item.name,
              username: item.userName, // userName -> username으로 표기 통일
              email: item.email,
              phone: item.phone ?? "",
              gender: item.gender ?? "",
              status: item.status ?? "",
              created_at: item.createDatetime
                ? new Date(item.createDatetime).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
            }))
          );

          setTotal(filtered.length); // 필터링된 전체 개수
        }
      } catch (error) {
        console.error("API 요청 실패:", error);
      }
    };

    fetchData();
  }, [page, activeFilter, refreshKey]);

  return (
    <div>
      <SearchSection>
        <Box>
          <Row className="gap-12">
            <Col>
              <Select
                label="입주사"
                value={searchFilter.type}
                disabled={permission === "OFFICE_SECRETARY_ADMIN"}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, type: e.target.value })
                }
              >
                {permission !== "OFFICE_SECRETARY_ADMIN" && (
                  <option value="">전체</option>
                )}
                {companyOptions.map((company) => (
                  <option key={company.companyName} value={company.companyName}>
                    {company.companyName}
                  </option>
                ))}
              </Select>
            </Col>
            <Col>
              <Input
                id={nameId}
                label={"이름"}
                value={searchFilter.name}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, name: e.target.value })
                }
                onClear={() => setSearchFilter({ ...searchFilter, name: "" })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPage(1);
                    setActiveFilter(searchFilter);
                    setSearchParams({ ...searchFilter, page: 1 });
                  }
                }}
              />
            </Col>
            <Col>
              <Input
                id={emailId}
                label={"아이디"}
                value={searchFilter.email}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, email: e.target.value })
                }
                onClear={() => setSearchFilter({ ...searchFilter, email: "" })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPage(1);
                    setActiveFilter(searchFilter);
                    setSearchParams({ ...searchFilter, page: 1 });
                  }
                }}
              />
            </Col>
            <Col>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">상태</span>
                <div className="flex flex-row items-center gap-4">
                  <Radio
                    name="status"
                    value=""
                    label="전체"
                    checked={searchFilter.status === ""}
                    onChange={() =>
                      setSearchFilter({ ...searchFilter, status: "" })
                    }
                  />
                  <Radio
                    name="status"
                    value="대기"
                    label="대기"
                    checked={searchFilter.status === "대기"}
                    onChange={() =>
                      setSearchFilter({ ...searchFilter, status: "대기" })
                    }
                  />
                  <Radio
                    name="status"
                    value="거절"
                    label="거절"
                    checked={searchFilter.status === "거절"}
                    onChange={() =>
                      setSearchFilter({ ...searchFilter, status: "거절" })
                    }
                  />
                </div>
              </div>
            </Col>
            <Col className="flex gap-2 self-end">
              <Button
                onClick={() => {
                  setPage(1);
                  setActiveFilter(searchFilter);
                  setSearchParams({ ...searchFilter, page: 1 });
                }}
              >
                검색
              </Button>
              <Button
                variant="outline" // 혹은 스타일 지정
                onClick={() => {
                  setSearchFilter(defaultFilter); // 필터 UI 초기화
                  setActiveFilter(defaultFilter); // 필터 상태 초기화
                  setPage(1); // 페이지 초기화
                  setSearchParams({ page: 1 }); // URL 파라미터 초기화
                }}
              >
                초기화
              </Button>
            </Col>
          </Row>
        </Box>
      </SearchSection>
      <div className="mb-4 flex items-center justify-between">
        <ResultSummary total={total} />

        <div className="flex gap-2">
          {permission !== "OFFICE_SECRETARY_ADMIN" && (
            <Button
              className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              onClick={handleClickApprove}
              disabled={updating}
            >
              승인
            </Button>
          )}
          <Button
            className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            onClick={handleClickReject}
            disabled={updating}
          >
            거절
          </Button>
        </div>
      </div>
      <ResultSection>
        <DataTable
          columns={[
            { key: "no", label: "번호" },
            { key: "companyName", label: "입주사" },
            { key: "name", label: "이름" },
            { key: "username", label: "아이디" },
            { key: "email", label: "이메일" },
            { key: "phone", label: "연락처" },
            { key: "gender", label: "성별" },
            { key: "status", label: "상태" },
            { key: "created_at", label: "등록일시" },
          ]}
          data={data}
          checkable={true}
          checkedIds={checkedIds}
          onCheck={handleCheck}
        />
        <Pagination
          current={page}
          totalPages={Math.ceil(total / size)}
          onChange={(page) => setPage(page)}
        />
      </ResultSection>
    </div>
  );
}
