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
import { useEffect, useId, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Radio from "@/components/common/Radio";
import api from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import useModal from "@/hooks/useModal";

export default function PermissionList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { permission, companyId, companyName } = useAuthStore(); // 회사명까지 사용
  const IS_SECRETARY = permission === "OFFICE_SECRETARY_ADMIN";

  const { showModal } = useModal();
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [checkedIds, setCheckedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);
  const initialAppliedRef = useRef(false); // 총무팀 고정값 1회만 적용
  const defaultFilter = {
    name: "",
    email: "",
    status: "",
    // 총무팀이면 입주사 셀렉트(type)를 내 회사명으로 고정
    type: IS_SECRETARY ? companyName || "" : "",
  };

  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);
  const [updating, setUpdating] = useState(false);

  const nameId = useId();
  const emailId = useId();

  const size = 30;

  useEffect(() => {
    let mounted = true;

    const loadCompanies = async () => {
      try {
        const { data: res } = await api.get("/api/v1/user/company");
        if (!mounted) return;
        if (!res?.success) return;

        const list = Array.isArray(res.data) ? res.data : [];

        // 1) 옵션 먼저 세팅
        if (IS_SECRETARY && companyId) {
          const mine = list.find(
            (c) => String(c.companyId) === String(companyId)
          );
          setCompanyOptions(mine ? [mine] : [{ companyId, companyName }]);
        } else {
          setCompanyOptions(list);
        }
        // 2) 값 고정은 1회만 (초기화/URL 동기화 이펙트가 덮어쓰지 않게)
        if (IS_SECRETARY && !initialAppliedRef.current) {
          setSearchFilter((prev) => ({ ...prev, type: companyName || "" }));
          setActiveFilter((prev) => ({ ...prev, type: companyName || "" }));
          initialAppliedRef.current = true;
        }

        setCompaniesLoaded(true);
      } catch (e) {
        console.error("/api/v1/user/company 실패:", e);
        setCompaniesLoaded(true);
      }
    };

    loadCompanies();
    return () => {
      mounted = false;
    };
  }, [IS_SECRETARY, companyId, companyName]);

  // 총무팀: 옵션 로딩 완료 후에도 type이 비어있으면 회사명 주입(안전망)
  useEffect(() => {
    if (IS_SECRETARY && companiesLoaded && !activeFilter.type) {
      setSearchFilter((prev) => ({ ...prev, type: companyName || "" }));
      setActiveFilter((prev) => ({ ...prev, type: companyName || "" }));
    }
  }, [IS_SECRETARY, companiesLoaded, activeFilter.type, companyName]);

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
        // 총무팀이면 companyId만 있으면 바로 조회 (회사명/옵션 로딩 대기 X)
        if (IS_SECRETARY) {
          if (!companyId) return;

          // 회사명 준비 상태: (1) companyOptions에서 내 ID 매칭되는 회사명  OR
          //                 (2) store의 companyName  OR
          //                 (3) 이미 고정된 activeFilter.type 중 하나라도 존재
          const nameReady = Boolean(
            companyOptions.find(
              (c) => String(c.companyId) === String(companyId)
            )?.companyName ||
              companyName ||
              activeFilter.type
          );
          if (!nameReady) return;
        }

        // ★ 서버 파라미터: 총무팀은 무조건 내 companyId, 관리자는 회사명→ID 역매핑
        let params = {};
        if (IS_SECRETARY) {
          params.companyId = companyId;
        } else {
          const selected = companyOptions.find(
            (c) => c.companyName === activeFilter.type
          );
          if (selected?.companyId != null)
            params.companyId = selected.companyId;
        }
        // (디버깅) console.log("wait-member params", params);

        const response = await api.get("/api/v1/user/wait-member", { params });
        const res = response.data;
        if (!res?.success) return;

        // ----- 원본 데이터 -----
        let filtered = Array.isArray(res.data) ? res.data : [];

        // ★ 정규화 유틸 + 총무팀용 '실사용 회사명' 계산
        const norm = (s) => (s ?? "").toString().trim().toLowerCase();
        const effectiveCompanyName = IS_SECRETARY
          ? // companyOptions에서 내 companyId에 해당하는 회사명 우선 사용
            (companyOptions.find(
              (c) => String(c.companyId) === String(companyId)
            )?.companyName ??
            // 없으면 store의 companyName
            companyName ??
            // 그래도 없으면 이미 고정된 activeFilter.type
            activeFilter.type)
          : activeFilter.type;

        // ★ 총무팀 방어 필터: 응답에 companyId가 있으면 ID로, 없으면 '정규화된 회사명'으로 필터
        if (IS_SECRETARY) {
          if (companyId && filtered.some((i) => i?.companyId != null)) {
            filtered = filtered.filter(
              (item) => String(item.companyId) === String(companyId)
            );
          } else if (effectiveCompanyName) {
            const target = norm(effectiveCompanyName);
            filtered = filtered.filter(
              (item) => norm(item.companyName) === target
            );
          }
        }

        // ★ (관리자/검색 공통) 회사명 보조 필터도 정규화 비교로
        if (activeFilter.type) {
          const target = norm(activeFilter.type);
          filtered = filtered.filter(
            (item) => norm(item.companyName) === target
          );
        }

        // 나머지 검색 필터
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

        // 정렬
        filtered.sort((a, b) => {
          const dateA = new Date(a.createDatetime);
          const dateB = new Date(b.createDatetime);
          return dateB - dateA;
        });

        // 페이징
        const startIndex = (page - 1) * size;
        const paginated = filtered.slice(startIndex, startIndex + size);
        const totalFiltered = filtered.length;

        // 상태 반영
        setData(
          paginated.map((item, index) => ({
            no: totalFiltered - (startIndex + index),
            _id: item.id,
            companyName: item.companyName,
            name: item.name,
            username: item.userName,
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
        setTotal(filtered.length);
      } catch (error) {
        console.error("API 요청 실패:", error);
      }
    };

    fetchData();
  }, [
    page,
    activeFilter,
    refreshKey,
    IS_SECRETARY,
    companyId,
    companiesLoaded, // 있어도 무방
    companyOptions, // effectiveCompanyName 계산을 위해 필요
  ]);

  return (
    <div>
      <SearchSection>
        <Box>
          <Row className="gap-12">
            <Col>
              <Select
                label="입주사"
                value={searchFilter.type || ""}
                disabled={permission === "OFFICE_SECRETARY_ADMIN"}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, type: e.target.value })
                }
              >
                {/* 옵션 로딩 전 또는 현재 값이 옵션 목록에 없을 때 임시 보관 */}
                {(!companiesLoaded ||
                  (searchFilter.type &&
                    !companyOptions.some(
                      (c) => c.companyName === searchFilter.type
                    ))) && (
                  <option value={searchFilter.type || ""}>
                    {searchFilter.type || (companiesLoaded ? "전체" : "로딩중")}
                  </option>
                )}
                {permission !== "OFFICE_SECRETARY_ADMIN" && (
                  <option value="">전체</option>
                )}
                {companyOptions.map((company) => (
                  <option key={company.companyId} value={company.companyName}>
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
