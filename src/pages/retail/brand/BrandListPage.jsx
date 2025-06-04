import { useEffect, useId, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/common/Button";
import DataTable from "@/components/common/DataTable";
import Input from "@/components/common/Input";
import Pagination from "@/components/common/Pagination";
import ResultSummary from "@/components/common/ResultSummary";
import Select from "@/components/common/Select";
import Radio from "@/components/common/Radio";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import Row from "@/components/layout/Row";
import SearchSection from "@/components/layout/SearchSection";
import ResultSection from "@/components/layout/ResultSection";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function BrandListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showModal } = useModal(); // 삭제할때 모달용 아직 미구현

  const [refreshKey, setRefreshKey] = useState(0);

  const [searchStatus, setSearchStatus] = useState("");

  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [checkedIds, setCheckedIds] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  
  const [category, setCategory] = useState(""); // 현재 선택된 카테고리
  const [categoryList, setCategoryList] = useState([]); // API로 받은 카테고리 목록
  const [visibility, setVisibility] = useState("");
  const defaultFilter = {
    name: "",
    category: "",
    status: "",
  };

  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  const size = 10;
  const nameId = useId();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get("/api/v1/brand/category");
        setCategoryList(res.data?.data || []);
        console.log("카테고리 목록:", res.data?.data);
      } catch (err) {
        console.error("카테고리 목록 불러오기 실패:", err);
      }
    };

    fetchCategory();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("/api/v1/brand", {
          params: {
            currentPageNo: page,
            category: activeFilter.category || undefined,
            brand: activeFilter.name || undefined,
            status: activeFilter.status || undefined,
          },
        });

        console.log("브랜드 목록 로딩 성공:", page, res.data);
        const json = res.data;

        if (json.success && Array.isArray(json.data)) {
          console.log("브랜드 목록 데이터:", json.data);
          const rows = json.data.map((entry, index) => {
            const items = entry.contentList || [];
            const koItem = items.find((i) => i.lang === "KO") || {};
            const enItem = items.find((i) => i.lang === "EN") || {};

            console.log("Item:", items, koItem, enItem);

            return {
              id: entry.id,
              masterId: entry.id,
              pid_ko: koItem.pid || null,
              pid_en: enItem.pid || null,
              occupancy: entry.rownum || 0,
              category: entry.category || "-",
              language:
                koItem.lang && enItem.lang ? "both" : koItem.lang ? "ko" : "en",
              ko_title: koItem.name || "-",
              en_title: enItem.name || "-",
              situation: "-", // status 없음
              status_ko: koItem.showYn === "노출" ? "노출" : "미노출",
              status_en: enItem.showYn === "노출" ? "노출" : "미노출",
              ko_status: koItem.useYn || "-",
              en_status: enItem.useYn|| "-",

              ko_created_at: koItem?.createDt?.split(" ")[0] || "-",
              en_created_at: enItem?.createDt?.split(" ")[0] || "-",
              ko_updated_at: koItem?.updateDt?.split(" ")[0] || "-",
              en_updated_at: enItem?.updateDt?.split(" ")[0] || "-",
              ko_created_user: koItem.createUser || "-",
              en_created_user: enItem.createUser || "-",
              ko_updated_user: koItem?.updateUser || "-",
              en_updated_user: enItem?.updateUser || "-",
              _id: `${entry.id}`,
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
              activeFilter.status === "" ||
              row.status_ko ===
                (activeFilter.status === "active" ? "노출" : "미노출") ||
              row.status_en ===
                (activeFilter.status === "active" ? "노출" : "미노출");

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
            // const startDateOnly = activeFilter.dateRange.startDate
            //   ? parseDateOnly(activeFilter.dateRange.startDate)
            //   : null;
            // const endDateOnly = activeFilter.dateRange.endDate
            //   ? parseDateOnly(activeFilter.dateRange.endDate)
            //   : null;

            // const dateMatch =
            //   (!startDateOnly || (rowDate && rowDate >= startDateOnly)) &&
            //   (!endDateOnly || (rowDate && rowDate <= endDateOnly));

            return titleMatch && categoryMatch && visibilityMatch;
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
          console.log("총 필터링된 데이터:", filtered.length);
          console.log(
            "현재 페이지:",
            page,
            "시작 인덱스:",
            start,
            "끝 인덱스:",
            end
          );
          console.log("원본 데이터 총 개수:", json.data.length);
          const sliced = sorted.slice(start, end).map((row, idx) => ({
            ...row,
            no: filtered.length - (start + idx),
            _id: `${row.id}`,
          }));

          setData(sliced);
          setTotal(filtered.length);
        }

        // const rows = res.data.data.map((brand, idx) => {
        //   const ko = Array.isArray(brand.contentList)
        //     ? brand.contentList.find((c) => c.lang?.toUpperCase() === "KO")
        //     : null;
        //   const en = Array.isArray(brand.contentList)
        //     ? brand.contentList.find((c) => c.lang?.toUpperCase() === "EN")
        //     : null;

        //   console.log("ko.name 확인:", ko?.name);
        //   console.log("en.name 확인:", en?.name);

        //   return {
        //     _id: String(brand.id),
        //     id: brand.id,
        //     masterId: brand.id,
        //     no: brand.rownum || (page - 1) * size + idx + 1,
        //     category: brand.category || "-",
        //     ko_title: ko?.name || "-",
        //     en_title: en?.name || "-",
        //     ko_status: ko?.useYn || "-",
        //     en_status: en?.useYn || "-",
        //     ko_created_at: ko?.createDt?.split(" ")[0] || "-",
        //     en_created_at: en?.createDt?.split(" ")[0] || "-",
        //     ko_created_user: ko?.createUser || "-",
        //     en_created_user: en?.createUser || "-",
        //     ko_updated_at: ko?.updateDt?.split(" ")[0] || "-",
        //     en_updated_at: en?.updateDt?.split(" ")[0] || "-",
        //     ko_updated_user: ko?.updateUser || "-",
        //     en_updated_user: en?.updateUser || "-",
        //   };
        // });

        // setData(rows);
        // setTotal(res.data.pageable.totalElements || 0);
      } catch (err) {
        console.error("브랜드 목록 로딩 실패:", err);
      }
    };

    fetchBrands();
  }, [page, activeFilter, refreshKey]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  };

  const handleDelete = async () => {
    const confirm = window.confirm("선택한 브랜드를 삭제하시겠습니까?");
    if (!confirm) return;

    const idsToDelete = checkedIds.map((id) => Number(id));
    console.log("삭제할 pmId 목록:", idsToDelete);

    try {
      const res = await api.post(
        "/api/v1/brand/delete",
        checkedIds.map((id) => Number(id))
      );

      if (res.status === 200) {
        alert("삭제가 완료되었습니다.");
        setCheckedIds([]);
        setPage(1);
        setRefreshKey((prev) => prev + 1); // 목록 새로고침
      } else {
        alert("삭제 실패: 서버 오류");
      }
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  return (
    <div>
      <SearchSection>
        <Box>
          <Row>
            <Col>
              <Select
                label="카테고리"
                value={searchFilter.category}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, category: e.target.value })
                }
              >
                <option value="">전체</option>
                {categoryList.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.value}
                  </option>
                ))}
              </Select>
            </Col>

            <Col>
              <Input
                id={nameId}
                label="브랜드명"
                value={searchFilter.name}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, name: e.target.value })
                }
                onClear={() => setSearchFilter({ ...searchFilter, name: "" })}
              />
            </Col>
            <Col className="flex flex-col items-start gap-4 justify-center">
              <span className="text-sm font-medium">사용 여부</span>
              <div className="flex flex-row items-center gap-4">
                <Radio
                  name="status"
                  value="active"
                  label="사용"
                  checked={searchFilter.status === "active"}
                  onChange={() =>
                    setSearchFilter({ ...searchFilter, status: "active" })
                  }
                />
                <Radio
                  name="status"
                  value="inactive"
                  label="미사용"
                  checked={searchFilter.status === "inactive"}
                  onChange={() =>
                    setSearchFilter({ ...searchFilter, status: "inactive" })
                  }
                />
              </div>
            </Col>
            <Col className="self-end flex gap-2">
              <Button
                onClick={() => {
                  setPage(1);
                  setActiveFilter(searchFilter);
                  setSearchParams({
                    name: searchFilter.name,
                    category: searchFilter.category,
                    status: searchFilter.status,
                    page: 1,
                  });
                }}
              >
                검색
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchFilter({
                    name: "",
                    category: "",
                    status: "",
                  });
                  setActiveFilter({
                    name: "",
                    category: "",
                    status: "",
                  });
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
            onClick={() => navigate("/retail/brand/regist")}
          >
            등록
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={handleDelete}
            disabled={checkedIds.length === 0} // 체크 없으면 비활성화
          >
            삭제
          </Button>
        </div>
      </div>

      <ResultSection>
        <DataTable
          columns={[
            { key: "no", label: "번호" },
            { key: "category", label: "카테고리" },
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
              label: "브랜드명",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  {row.ko_title === "-" ? (
                    <p
                      className="text-black-600 p-2 text-left"
                      onClick={() =>
                        navigate(`/retail/brand/detail/${row.masterId}?lang=ko`)
                      }
                    >
                      -
                    </p>
                  ) : (
                    <button
                      className="text-black-600 truncate p-2 text-left underline"
                      onClick={() =>
                        navigate(`/retail/brand/detail/${row.masterId}?lang=ko`)
                      }
                    >
                      {row.ko_title}
                    </button>
                  )}
                  {row.en_title === "-" ? (
                    <p
                      className="text-black-600 p-2 text-left"
                      onClick={() =>
                        navigate(`/retail/brand/detail/${row.masterId}?lang=en`)
                      }
                    >
                      -
                    </p>
                  ) : (
                    <button
                      className="text-black-600 truncate p-2 text-left underline"
                      onClick={() =>
                        navigate(`/retail/brand/detail/${row.masterId}?lang=en`)
                      }
                    >
                      {row.en_title}
                    </button>
                  )}
                  {row.ko_title === "-" && row.en_title === "-" ? (
                    <p className="text-black-600 p-2 text-left">-</p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "status",
              label: "사용여부",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <p className="text-black-600 p-2 text-center">
                    {row.ko_status}
                  </p>
                  <p className="text-black-600 p-2 text-center">
                    {row.en_status}
                  </p>
                </div>
              ),
            },
            {
              key: "created_at",
              label: "등록일시",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <p className="text-black-600 p-2 text-center">
                    {row.ko_created_at}
                  </p>
                  <p className="text-black-600 p-2 text-center">
                    {row.en_created_at}
                  </p>
                </div>
              ),
            },
            {
              key: "created_user",
              label: "등록자",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <p className="text-black-600 p-2 text-center">
                    {row.ko_created_user}
                  </p>
                  <p className="text-black-600 p-2 text-center">
                    {row.en_created_user}
                  </p>
                </div>
              ),
            },
            {
              key: "updated_at",
              label: "수정일시",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <p className="text-black-600 p-2 text-center">
                    {row.ko_updated_at}
                  </p>
                  <p className="text-black-600 p-2 text-center">
                    {row.en_updated_at}
                  </p>
                </div>
              ),
            },
            {
              key: "updated_user",
              label: "수정자",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <p className="text-black-600 p-2 text-center">
                    {row.ko_updated_user}
                  </p>
                  <p className="text-black-600 p-2 text-center">
                    {row.en_updated_user}
                  </p>
                </div>
              ),
            },
          ]}
          data={data}
          checkable
          checkedIds={checkedIds}
          onCheck={(id, checked) => {
            setCheckedIds((prev) =>
              checked ? [...prev, id] : prev.filter((v) => v !== id)
            );
          }}
        />

        <Pagination
          current={page}
          totalPages={Math.ceil(total / size)}
          onChange={(page) => {
            setPage(page);
            setSearchParams({ name, category, visibility, page });
          }}
        />
        {/* <Pagination
          current={page}
          totalPages={Math.ceil(total / size)}
          onChange={
            (newPage) => {
              setPage(newPage);
              setSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                page: newPage,
              });
            }
          }
        /> */}
      </ResultSection>
    </div>
  );
}
