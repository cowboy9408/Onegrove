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
import useModal from "@/hooks/useModal";

export default function StoriesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [checkedIds, setCheckedIds] = useState([]);

  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const nameId = useId();
  const nameCategory = useId();

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
    setSearchParams({
      name: searchFilter.name,
      category: searchFilter.category,
      visibility: searchFilter.visibility,
      page: 1,
    });
  };

  const size = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/stories");
        const json = res.data?.data || [];

        if (Array.isArray(json)) {
          const rows = json.map((item, index) => {
            const koItem =
              item.contentList.find((i) => i.lang.toUpperCase() === "KO") || {};
            const enItem =
              item.contentList.find((i) => i.lang.toUpperCase() === "EN") || {};

            return {
              originalIndex: item.id,
              _id: String(item.id),
              no: index + 1,
              occupancy: Number(koItem.sort) || 0,
              ko_occupancy: Number(koItem.sort) || "-",
              en_occupancy: Number(enItem.sort) || "-",
              ko_category: koItem.category || "-",
              en_category: enItem.category || "-",
              language:
                koItem.lang && enItem.lang ? "both" : koItem.lang ? "ko" : "en",
              ko_title: koItem.title || "-",
              en_title: enItem.title || "-",
              status: koItem.status || "진행중",
              showYn: koItem.showYn || "미노출",

              status_ko: koItem.status || "진행중",
              status_en: enItem.status || "진행중",
              showYn_ko: koItem.showYn || "미노출",
              showYn_en: enItem.showYn || "미노출",

              created_user_ko: koItem.createUser || "-",
              created_user_en: enItem.createUser || "-",

              created_at_ko: koItem.createDt || "-",
              created_at_en: enItem.createDt || "-",
              created_at: koItem.createDt || enItem.createDt || "-",

              created_user: koItem.created_user || "-",
              // created_at: koItem.createDcreateUsert || "-",
            };
          });

          // 필터 + 정렬
          const filtered = rows.filter((row) => {
            const titleMatch =
              activeFilter.name === "" ||
              row.ko_title.includes(activeFilter.name) ||
              row.en_title.includes(activeFilter.name);

            const normalize = (str) =>
              (str || "").toLowerCase().replace(/\s/g, "").trim();

            const filterCategory = normalize(activeFilter.category);

            const categoryMatch =
              filterCategory === "" ||
              normalize(row.ko_category).includes(filterCategory) ||
              normalize(row.en_category).includes(filterCategory);

            const visibilityMatch =
              activeFilter.visibility === "" ||
              row.showYn_ko ===
                (activeFilter.visibility === "Y" ? "노출" : "미노출") ||
              row.showYn_en ===
                (activeFilter.visibility === "Y" ? "노출" : "미노출");

            const start = activeFilter.dateRange.startDate;
            const end = activeFilter.dateRange.endDate;

            const isValidDate = (date) =>
              date instanceof Date && !isNaN(date.getTime());

            const createdDate = new Date(row.created_at);
            const dateMatch =
              (!start ||
                (isValidDate(createdDate) && createdDate >= new Date(start))) &&
              (!end ||
                (isValidDate(createdDate) && createdDate <= new Date(end)));

            return titleMatch && categoryMatch && visibilityMatch && dateMatch;
          });

          const start = (page - 1) * size;
          const end = start + size;
          const sliced = filtered.slice(start, end).map((row, idx) => ({
            ...row,
            no: filtered.length - (start + idx),
          }));

          setData(sliced);
          setTotal(filtered.length);
        }
      } catch (err) {
        console.error("스토리 목록 불러오기 실패:", err);
      }
    };

    fetchData();
  }, [page, activeFilter]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  };

  return (
    <div>
      <SearchSection>
        <Box className="space-y-4">
          <div className="flex w-full flex-col gap-1">
            {/* 라벨 줄 */}
            <div className="flex gap-4">
              <div className="w-[560px]">
                <span className="text-sm font-medium">카테고리</span>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">게시글 등록일</span>
              </div>
            </div>

            {/* 입력 줄 */}
            <div className="flex gap-16">
              {/* 카테고리 Input -> Select 로 바꾸는 것도 고려 */}
              <div className="w-[505px]">
                <Input
                  id={nameCategory}
                  value={searchFilter.category}
                  onChange={(e) =>
                    setSearchFilter({
                      ...searchFilter,
                      category: e.target.value,
                    })
                  }
                  onClear={() =>
                    setSearchFilter({ ...searchFilter, category: "" })
                  }
                />
              </div>
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

          {/* 타이틀, 노출 여부, 버튼 */}
          <Row className="flex w-full flex-wrap items-end gap-4">
            <Row className="flex w-full gap-20">
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
              navigate("/contents/whatson/stories/regist");
            }}
          >
            등록
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              if (checkedIds.length === 0) return;
              showModal({
                title: "스토리 삭제 확인",
                message: "정말 삭제하시겠습니까?",
                showCancel: true,
                confirmButton: "삭제",
                onConfirm: async () => {
                  try {
                    await api.post(
                      "/api/v1/stories/delete",
                      checkedIds.map((id) => Number(id))
                    );

                    setCheckedIds([]);
                    setPage(1);
                    window.location.reload();
                  } catch (err) {
                    console.error("삭제 실패:", err);
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
              key: "occupancy",
              label: "노출순서",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2 font-medium">{row.ko_occupancy}</div>
                  <div className="p-2 font-medium">{row.en_occupancy}</div>
                </div>
              ),
            },
            {
              key: "category",
              label: "카테고리",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2 font-medium">{row.ko_category}</div>
                  <div className="p-2 font-medium">{row.en_category}</div>
                </div>
              ),
            },
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
                    className={`text-black-600 cursor-pointer truncate p-2 text-left ${row.ko_title !== "-" && row.ko_title !== null && "underline"}`}
                    onClick={() =>
                      navigate(
                        `/contents/whatson/stories/${row.originalIndex}?lang=ko`
                      )
                    }
                  >
                    {row.ko_title}
                  </button>
                  <button
                    className={`text-black-600 cursor-pointer truncate p-2 text-left ${row.en_title !== "-" && row.en_title !== null && "underline"}`}
                    onClick={() =>
                      navigate(
                        `/contents/whatson/stories/${row.originalIndex}?lang=en`
                      )
                    }
                  >
                    {row.en_title}
                  </button>
                </div>
              ),
            },
            {
              key: "status",
              label: "상태여부",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="py-2">{row.status_ko}</div>
                  <div className="py-2">{row.status_en}</div>
                </div>
              ),
            },
            {
              key: "showYn",
              label: "노출여부",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="py-2">{row.showYn_ko}</div>
                  <div className="py-2">{row.showYn_en}</div>
                </div>
              ),
            },
            {
              key: "created_user",
              label: "등록자",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="py-2">{row.created_user_ko}</div>
                  <div className="py-2">{row.created_user_en}</div>
                </div>
              ),
            },
            {
              key: "created_at",
              label: "등록일시",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="py-2">{row.created_at_ko}</div>
                  <div className="py-2">{row.created_at_en}</div>
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
          onChange={(page) => setPage(page)}
        />
      </ResultSection>
    </div>
  );
}
