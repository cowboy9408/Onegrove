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
import { useSearchParams, useNavigate } from "react-router-dom";
import Radio from "@/components/common/Radio";
import DateRangePicker from "@/components/common/Datepicker";
import api from "@/lib/apiClient";

export default function PressListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkedIds, setCheckedIds] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [name, setName] = useState(searchParams.get("name") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState(""); // 현재 선택된 카테고리
  const [categoryList, setCategoryList] = useState([]); // API로 받은 카테고리 목록
  const [visibility, setVisibility] = useState("");

  const nameId = useId();

  const size = 30;

  const defaultFilter = {
    name: "",
    category: "",
    visibility: "",
    dateRange: {
      startDate: null,
      endDate: null,
    },
  };
  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  const handleSearch = () => {
    setPage(1);
    setActiveFilter(searchFilter);
    const params = {
      name: searchFilter.name,
      category: searchFilter.category,
      visibility: searchFilter.visibility,
      page: 1,
    };
    if (searchFilter.dateRange.startDate) {
      params.startDate = searchFilter.dateRange.startDate
        .toISOString()
        .split("T")[0];
    }
    if (searchFilter.dateRange.endDate) {
      params.endDate = searchFilter.dateRange.endDate
        .toISOString()
        .split("T")[0];
    }
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/v1/press/category");
        const result = res.data?.data;
        if (Array.isArray(result)) {
          setCategoryList(result);
        }
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/press");
        const json = res.data;

        if (json.success && Array.isArray(json.data)) {
          const rows = json.data.map((entry, index) => {
            const items = entry.press || [];
            const koItem = items.find((i) => i.lang === "ko") || {};
            const enItem = items.find((i) => i.lang === "en") || {};

            return {
              originalIndex: index,
              pmId: entry.pmId,
              pid_ko: koItem.pid || null,
              pid_en: enItem.pid || null,
              occupancy: entry.rownum || 0,
              name: entry.categoryValue || "-",
              language:
                koItem.lang && enItem.lang ? "both" : koItem.lang ? "ko" : "en",
              ko_title: koItem.title || "-",
              en_title: enItem.title || "-",
              situation: "-", // status 없음
              status_ko: koItem.showYn === "Y" ? "노출" : "미노출",
              status_en: enItem.showYn === "Y" ? "노출" : "미노출",

              created_user_ko: koItem.createUser || "-",
              created_user_en: enItem.createUser || "-",

              created_at_ko: koItem.createDatetime || "-",
              created_at_en: enItem.createDatetime || "-",
              _id: `${entry.pmId}`,
            };
          });

          // 검색 필터링
          const filtered = rows.filter((row) => {
            const titleMatch =
              activeFilter.name === "" ||
              row.ko_title.includes(activeFilter.name) ||
              row.en_title.includes(activeFilter.name);

            const categoryMatch =
              activeFilter.category === "" ||
              row.name === activeFilter.category;

            const visibilityMatch =
              activeFilter.visibility === "" ||
              row.status_ko ===
                (activeFilter.visibility === "Y" ? "노출" : "미노출") ||
              row.status_en ===
                (activeFilter.visibility === "Y" ? "노출" : "미노출");

            function parseDateOnly(input) {
              const date = new Date(input);
              if (isNaN(date.getTime())) return null;
              return new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              );
            }

            const rowDate = parseDateOnly(
              row.created_at_ko || row.created_at_en
            );
            const startDateOnly = activeFilter.dateRange.startDate
              ? parseDateOnly(activeFilter.dateRange.startDate)
              : null;
            const endDateOnly = activeFilter.dateRange.endDate
              ? parseDateOnly(activeFilter.dateRange.endDate)
              : null;

            const dateMatch =
              (!startDateOnly || (rowDate && rowDate >= startDateOnly)) &&
              (!endDateOnly || (rowDate && rowDate <= endDateOnly));

            return titleMatch && categoryMatch && visibilityMatch && dateMatch;
          });

          function parseValidDate(str) {
            if (!str || str === "-") return new Date("1970-01-01");
            return new Date(str);
          }

          const sorted = filtered.sort((a, b) => {
            const dateA = parseValidDate(a.created_at_ko || a.created_at_en);
            const dateB = parseValidDate(b.created_at_ko || b.created_at_en);
            return dateB - dateA; // 최신순
          });

          const start = (page - 1) * size;
          const end = start + size;

          const sliced = sorted.slice(start, end).map((row, idx) => ({
            ...row,
            no: filtered.length - (start + idx),
            _id: `${row.pmId}`,
          }));

          setData(sliced);
          setTotal(filtered.length);
        }
      } catch (err) {
        console.error("프레스 목록 API 호출 실패:", err);
      }
    };

    fetchData();
  }, [page, activeFilter, refreshKey]);

  useEffect(() => {
    const refreshParam = searchParams.get("refresh");
    if (refreshParam) {
      setRefreshKey((prev) => prev + 1); // 강제 새로고침 트리거
    }
  }, [searchParams]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) => {
      const newChecked = checked ? [...prev, id] : prev.filter((v) => v !== id);

      return newChecked;
    });
  };

  return (
    <div>
      <SearchSection>
        <Box className="space-y-4">
          <div className="flex w-full flex-col gap-1">
            {/* 라벨 줄 */}
            <div className="flex gap-4">
              {/* 카테고리 라벨 */}
              <div className="w-[560px]">
                <span className="text-sm font-medium">카테고리</span>
              </div>
              {/* 게시글 등록일 라벨 */}
              <div className="flex-1">
                <span className="text-sm font-medium">게시글 등록일</span>
              </div>
            </div>

            {/* 입력 줄 */}
            <div className="flex gap-16">
              {/* 카테고리 Select */}
              <div className="w-[505px]">
                <Select
                  value={searchFilter.category}
                  onChange={(e) =>
                    setSearchFilter({
                      ...searchFilter,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="">전체</option>
                  {categoryList.map((cat) => (
                    <option key={cat.code} value={cat.value}>
                      {cat.value}
                    </option>
                  ))}
                </Select>
              </div>

              {/* 게시글 등록일 DateRangePicker */}
              <div className="flex-1">
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
          </div>

          <Row className="flex w-full flex-wrap items-end gap-4">
            <Row className="flex w-full gap-20">
              {/* 타이틀 영역 */}
              <div className="flex w-[500px] flex-col">
                <span className="mb-1 text-sm font-medium">타이틀</span>
                <Input
                  id={nameId}
                  value={searchFilter.name}
                  onChange={(e) =>
                    setSearchFilter({ ...searchFilter, name: e.target.value })
                  }
                  onClear={() => setSearchFilter({ ...searchFilter, name: "" })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
              </div>

              {/* 노출 여부 영역 */}
              <div className="flex min-w-[240px] flex-col">
                <span className="mb-1 text-sm font-medium">노출 여부</span>
                <div className="mt-[15px] flex gap-4">
                  <Radio
                    id="visible"
                    name="visibility"
                    value="Y"
                    checked={searchFilter.visibility === "Y"}
                    onChange={(e) =>
                      setSearchFilter({
                        ...searchFilter,
                        visibility: e.target.value,
                      })
                    }
                    label="노출"
                  />
                  <Radio
                    id="hidden"
                    name="visibility"
                    value="N"
                    checked={searchFilter.visibility === "N"}
                    onChange={(e) =>
                      setSearchFilter({
                        ...searchFilter,
                        visibility: e.target.value,
                      })
                    }
                    label="미노출"
                  />
                </div>
              </div>
            </Row>
            <Col className="flex w-1/4 justify-end gap-2">
              <Button onClick={handleSearch}>검색</Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchFilter(defaultFilter);
                  setActiveFilter(defaultFilter);
                  setPage(1);
                  setSearchParams({ page: 1 });
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
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              navigate("/contents/whatson/media/regist");
            }}
          >
            등록
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={async () => {
              if (checkedIds.length === 0) {
                alert("삭제할 항목을 선택해주세요.");
                return;
              }

              const confirm = window.confirm(
                "선택한 프레스 콘텐츠를 삭제하시겠습니까?"
              );
              if (!confirm) return;

              const idsToDelete = checkedIds.map((id) => Number(id));

              try {
                const res = await api.post("/api/v1/press/delete", {
                  checkArr: idsToDelete,
                });

                if (res.status === 200) {
                  alert("삭제가 완료되었습니다.");
                  setCheckedIds([]);
                  setPage(1);
                  setSearchParams({ name, category, visibility, page: 1 });
                  setRefreshKey((prev) => prev + 1); // 목록 새로고침
                } else {
                  alert("삭제 실패: 서버 오류");
                }
              } catch (err) {
                console.error("삭제 요청 실패:", err);
                alert("삭제 중 오류가 발생했습니다.");
              }
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
            { key: "name", label: "카테고리" },
            {
              key: "language",
              label: "언어",
              render: () => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2 font-medium">ko</div>
                  <div className="p-2 font-medium">en</div>
                </div>
              ),
            },
            {
              key: "title",
              label: "타이틀",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <button
                    className={`text-black-600 truncate p-2 text-left ${row.ko_title !== "-" && row.ko_title !== null && "underline"}`}
                    onClick={() =>
                      navigate(`/contents/whatson/media/${row.pmId}?lang=ko`)
                    }
                  >
                    {row.ko_title}
                  </button>
                  <button
                    className={`text-black-600 truncate p-2 text-left ${row.en_title !== "-" && row.en_title !== null && "underline"}`}
                    onClick={() =>
                      navigate(`/contents/whatson/media/${row.pmId}?lang=en`)
                    }
                  >
                    {row.en_title}
                  </button>
                </div>
              ),
            },
            {
              key: "status",
              label: "노출여부",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.status_ko}</div>
                  <div className="p-2">{row.status_en}</div>
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
          ]}
          data={data}
          link={{ base: "/admin", path: "no" }}
          checkable={true}
          checkedIds={checkedIds}
          onCheck={handleCheck}
        />
        <Pagination
          current={page}
          totalPages={Math.ceil(total / size)}
          onChange={(page) => {
            setPage(page);
            setSearchParams({ name, category, visibility, page });
          }}
        />
      </ResultSection>
    </div>
  );
}
