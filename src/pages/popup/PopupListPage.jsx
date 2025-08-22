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
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DateRangePicker from "@/components/common/Datepicker";
import Radio from "@/components/common/Radio";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function PopupListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showModal } = useModal();

  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [visibility, setVisibility] = useState(
    searchParams.get("visibility") || ""
  ); // "Y" | "N" | ""
  const [startDate, setStartDate] = useState(
    searchParams.get("start") ? new Date(searchParams.get("start")) : null
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("end") ? new Date(searchParams.get("end")) : null
  );

  // YYYY-MM-DD (로컬)
  const fmtDate = (d) => {
    if (!d) return "";
    const dd = new Date(d);
    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, "0");
    const day = String(dd.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // YYYY-MM-DD HH:mm:ss (로컬, 시작/끝 경계)
  const fmtDateTime = (d, end = false) => {
    if (!d) return "";
    const base = fmtDate(d);
    return end ? `${base} 23:59:59` : `${base} 00:00:00`;
  };

  // API에서 내려온 "YYYY-MM-DD HH:mm:ss" → Date
  const parseApiDate = (s) =>
    typeof s === "string" ? new Date(s.replace(" ", "T")) : null;

  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [checkedIds, setCheckedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const size = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) 백엔드가 어떤 키를 받는지 모를 때를 대비해 "안전망"으로 여러 키 동시 전송
        const startStr = startDate ? fmtDateTime(startDate, false) : "";
        const endStr = endDate ? fmtDateTime(endDate, true) : "";

        const params = {
          page,
          size,
          ...(title
            ? { title, name: title, popupTitle: title, keyword: title }
            : {}),
          ...(visibility ? { useYn: visibility, visibility } : {}),
          ...(startStr
            ? {
                startDt: startStr,
                startDate: startStr,
                fromDt: startStr,
                start: startStr,
              }
            : {}),
          ...(endStr
            ? { endDt: endStr, endDate: endStr, toDt: endStr, end: endStr }
            : {}),
        };

        const res = await api.get("/api/v1/popup", { params });

        // 원본 리스트
        const raw = Array.isArray(res?.data?.data) ? res.data.data : [];

        // 2) 프론트 폴백 필터 (서버가 필터/페이징을 무시해도 동작 보장)
        const sod = startDate
          ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
          : null;
        const eod = endDate
          ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
          : null;

        const matchesTitle = (item) => {
          if (!title?.trim()) return true;
          const t = title.trim().toLowerCase();
          const ko =
            item.contentList?.find((c) => c.lang === "KO")?.title ?? "";
          const en =
            item.contentList?.find((c) => c.lang === "EN")?.title ?? "";
          return ko.toLowerCase().includes(t) || en.toLowerCase().includes(t);
        };

        const matchesVisibility = (item) => {
          if (!visibility) return true;
          const ko = item.contentList?.find((c) => c.lang === "KO")?.useYn;
          const en = item.contentList?.find((c) => c.lang === "EN")?.useYn;
          return ko === visibility || en === visibility;
        };

        // 현재 UI 라벨은 "등록일"이지만 서버엔 period(start/end)가 내려옵니다.
        // 아래 필터는 start/end 기간으로 동작합니다. (createDt 기준으로 바꾸려면 안내 드릴게요)
        const matchesPeriod = (item) => {
          if (!sod && !eod) return true;
          const ko = item.contentList?.find((c) => c.lang === "KO");
          const en = item.contentList?.find((c) => c.lang === "EN");
          const langs = [ko, en].filter(Boolean);

          return langs.some((c) => {
            const s = parseApiDate(c.startDt); // 시작
            const e = parseApiDate(c.endDt); // 종료
            if (!s || !e) return false;

            // 겹침(overlap) 조건
            const overlapStartOk = !eod || s <= eod; // 시작이 선택 종료 이전
            const overlapEndOk = !sod || e >= sod; // 종료가 선택 시작 이후
            return overlapStartOk && overlapEndOk;
          });
        };

        const filtered = raw.filter(
          (item) =>
            matchesTitle(item) && matchesVisibility(item) && matchesPeriod(item)
        );

        // 3) 서버가 pageable을 안 주면 프론트에서 페이징
        const pageable = res?.data?.pageable;
        const hasServerPaging =
          !!pageable && typeof pageable?.totalElements === "number";
        const totalElements = hasServerPaging
          ? pageable.totalElements
          : filtered.length;

        // 클라이언트 페이징 슬라이스
        const startIdx = (page - 1) * size;
        const pageSlice = hasServerPaging
          ? filtered
          : filtered.slice(startIdx, startIdx + size);
        setTotal(totalElements);

        const looksLikeDate = (v) =>
          typeof v === "string" && /\d{4}-\d{2}-\d{2}/.test(v);

        const norm = (entry) => {
          if (!entry) {
            return {
              title: "-",
              startDt: "-",
              endDt: "-",
              useYn: "-",
              createUser: "-",
              createDt: "-",
            };
          }
          // createUser/createDt 뒤바뀐 값 안전 처리
          const rawUser = entry.createUser ?? "-";
          const rawDt = entry.createDt ?? "-";
          const createUser =
            looksLikeDate(rawUser) && !looksLikeDate(rawDt) ? rawDt : rawUser;
          const createDt = looksLikeDate(rawDt)
            ? rawDt
            : looksLikeDate(rawUser)
              ? rawUser
              : rawDt;

          return {
            title: entry.title ?? "-",
            startDt: entry.startDt ?? "-",
            endDt: entry.endDt ?? "-",
            useYn: entry.useYn ?? "-",
            createUser,
            createDt,
          };
        };

        const tableData = pageSlice.map((item) => {
          const id = item.id;
          const rownum = item.rownum ?? "";
          const ko = norm(item.contentList?.find((c) => c.lang === "KO"));
          const en = norm(item.contentList?.find((c) => c.lang === "EN"));

          return {
            id,
            pmId: id,
            no: rownum,
            ko_title: ko.title,
            en_title: en.title,
            status_ko: ko.useYn,
            status_en: en.useYn,
            start_ko: ko.startDt,
            start_en: en.startDt,
            end_ko: ko.endDt,
            end_en: en.endDt,
            created_user_ko: ko.createUser,
            created_user_en: en.createUser,
            created_at_ko: ko.createDt,
            created_at_en: en.createDt,
          };
        });

        setData(tableData);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [page, refreshKey]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  };

  const handleSearch = () => {
    const params = {
      title,
      visibility,
      start: fmtDate(startDate),
      end: fmtDate(endDate),
      page: 1,
    };
    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k];
    });
    setPage(1);
    setSearchParams(params);
    setRefreshKey((k) => k + 1);
  };

  const handleReset = () => {
    setTitle("");
    setVisibility("");
    setStartDate(null);
    setEndDate(null);
    setPage(1);
    setSearchParams({ page: 1 });
    setRefreshKey((k) => k + 1);
  };

  return (
    <div>
      <SearchSection>
        <Box>
          {/* 1행: 등록일(좌) / 노출여부(우) */}
          <Row className="items-end gap-4">
            <Col className="w-1/2">
              <div className="mb-2 text-sm font-medium">등록일</div>
              <DateRangePicker
                mode="range"
                startDate={startDate}
                endDate={endDate}
                onRangeChange={({ startDate, endDate }) => {
                  setStartDate(startDate);
                  setEndDate(endDate);
                }}
              />
            </Col>

            <Col className="w-1/2">
              <div className="mb-2 text-sm font-medium">노출 여부</div>
              <div className="flex items-center gap-6">
                <Radio
                  id="visible"
                  name="visibility"
                  value="Y"
                  checked={visibility === "Y"}
                  onChange={(e) => setVisibility(e.target.value)}
                  label="노출"
                />
                <Radio
                  id="hidden"
                  name="visibility"
                  value="N"
                  checked={visibility === "N"}
                  onChange={(e) => setVisibility(e.target.value)}
                  label="미노출"
                />
                {/* 전체(제거) 상태로 두고 싶으면 라디오를 선택 해제하거나 초기화 버튼을 사용하세요 */}
              </div>
            </Col>
          </Row>

          {/* 2행: 타이틀(좌) / 버튼들(우) */}
          <Row className="mt-4 items-end gap-4">
            <Col className="w-1/2">
              <Input
                id="popup-title"
                label="타이틀"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onClear={() => setTitle("")}
              />
            </Col>

            <Col className="w-1/2">
              <div className="flex justify-end gap-2">
                <Button className="h-12 px-6" onClick={handleSearch}>
                  검색
                </Button>
                <Button
                  className="h-12 px-6"
                  variant="outline"
                  onClick={handleReset}
                >
                  초기화
                </Button>
              </div>
            </Col>
          </Row>
        </Box>
      </SearchSection>

      <div className="mb-4 flex items-center justify-between">
        <ResultSummary total={total} />

        <div className="flex gap-2">
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              navigate("/popup/regist");
            }}
          >
            등록
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              if (checkedIds.length === 0) {
                showModal({
                  title: "알림",
                  message: "삭제할 항목을 선택해주세요.",
                  confirmButton: "확인",
                });
                return;
              }

              showModal({
                title: "팝업 삭제 확인",
                message: "선택한 팝업을 삭제하시겠습니까?",
                showCancel: true,
                confirmButton: "삭제",
                onConfirm: async () => {
                  try {
                    const res = await api.post(
                      "/api/v1/popup/delete",
                      checkedIds.map(Number)
                    );

                    if (res.status === 200) {
                      showModal({
                        title: "완료",
                        message: "삭제가 완료되었습니다.",
                        confirmButton: "확인",
                      });
                      setCheckedIds([]);
                      setPage(1);
                      setRefreshKey((prev) => prev + 1);
                    } else {
                      showModal({
                        title: "오류",
                        message: "삭제 실패: 서버 오류",
                        confirmButton: "확인",
                      });
                    }
                  } catch (err) {
                    console.error("팝업 삭제 요청 실패:", err);
                    showModal({
                      title: "에러",
                      message: "삭제 중 오류가 발생했습니다.",
                      confirmButton: "확인",
                    });
                  }
                },
              });
            }}
          >
            삭제
          </Button>
        </div>
      </div>
      <ResultSection>
        <DataTable
          columns={[
            { key: "no", label: "번호" },
            {
              key: "language",
              label: "언어",
              render: () => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2 font-medium">KO</div>
                  <div className="p-2 font-medium">EN</div>
                </div>
              ),
            },

            {
              key: "title",
              label: "타이틀",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <button
                    className={`text-black-600 truncate p-2 text-left ${row.ko_title !== "-" ? "underline" : ""}`}
                    onClick={() =>
                      navigate(`/popup/detail/${row.pmId}?lang=ko`)
                    }
                  >
                    {row.ko_title}
                  </button>
                  <button
                    className={`text-black-600 truncate p-2 text-left ${row.en_title !== "-" ? "underline" : ""}`}
                    onClick={() =>
                      navigate(`/popup/detail/${row.pmId}?lang=en`)
                    }
                  >
                    {row.en_title}
                  </button>
                </div>
              ),
            },

            {
              key: "status",
              label: "노출 여부",
              render: (row) => {
                // 변환 함수 정의
                const label = (v) => {
                  if (v === "Y") return "노출";
                  if (v === "N") return "미노출";
                  return "-"; // 값이 없거나 다른 경우
                };

                return (
                  <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="p-2">{label(row.status_ko)}</div>
                    <div className="p-2">{label(row.status_en)}</div>
                  </div>
                );
              },
            },

            {
              key: "startDt",
              label: "시작일",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.start_ko}</div>
                  <div className="p-2">{row.start_en}</div>
                </div>
              ),
            },
            {
              key: "endDt",
              label: "종료일",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.end_ko}</div>
                  <div className="p-2">{row.end_en}</div>
                </div>
              ),
            },
            {
              key: "created_at",
              label: "등록일시",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.created_at_ko}</div>
                  <div className="p-2">{row.created_at_en}</div>
                </div>
              ),
            },

            {
              key: "created_user",
              label: "등록자",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.created_user_ko}</div>
                  <div className="p-2">{row.created_user_en}</div>
                </div>
              ),
            },
          ]}
          data={data}
          checkable={true}
          checkedIds={checkedIds}
          onCheck={handleCheck}
        />

        <Pagination
          current={page}
          totalPages={Math.max(1, Math.ceil(total / size))}
          onChange={(p) => {
            setPage(p);
            setSearchParams({ ...Object.fromEntries(searchParams), page: p });
          }}
        />
      </ResultSection>
    </div>
  );
}
