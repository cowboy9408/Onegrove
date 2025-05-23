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
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("");

  const nameId = useId();

  const size = 10;

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
              status: koItem.showYn === "Y" ? "노출" : "비노출",
              created_user: koItem.createUser || enItem.createUser || "-",
              created_at: koItem.createDatetime || enItem.createDatetime || "-",

              _id: `${entry.pmId}`,
            };
          });

          // 검색 필터링
          const filtered = rows.filter((row) => {
            const titleMatch =
              name === "" ||
              row.ko_title.includes(name) ||
              row.en_title.includes(name);
            const categoryMatch = category === "" || row.name === category;
            const visibilityMatch =
              visibility === "" || row.status === visibility;
            const dateMatch =
              (!dateRange.startDate ||
                new Date(row.created_at) >= new Date(dateRange.startDate)) &&
              (!dateRange.endDate ||
                new Date(row.created_at) <= new Date(dateRange.endDate));

            return titleMatch && categoryMatch && visibilityMatch && dateMatch;
          });

          const sorted = filtered.sort((a, b) => a.occupancy - b.occupancy);

          const start = (page - 1) * size;
          const end = start + size;
          const sliced = sorted.slice(start, end).map((row, idx) => ({
            ...row,
            no: start + idx + 1,
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
  }, [page, name, category, visibility, dateRange, refreshKey]);

  useEffect(() => {
    const refreshParam = searchParams.get("refresh");
    if (refreshParam) {
      setRefreshKey((prev) => prev + 1); // 강제 새로고침 트리거
    }
  }, [searchParams]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // 목업 데이터 생성
  //       const mockData = [
  //         {
  //           pmId: 2,
  //           rownum: 1,
  //           press: [
  //             {
  //               pid: 101,
  //               lang: "ko",
  //               title: "한국어 제목",
  //               showYn: "Y",
  //               createUser: "관리자",
  //               createDatetime: "2024-01-01",
  //             },
  //             {
  //               pid: 102,
  //               lang: "en",
  //               title: "English Title",
  //               showYn: "Y",
  //               createUser: "Admin",
  //               createDatetime: "2024-01-01",
  //             },
  //           ],
  //         },
  //         {
  //           pmId: 3,
  //           rownum: 2,
  //           press: [
  //             {
  //               pid: 103,
  //               lang: "ko",
  //               title: "다른 제목",
  //               showYn: "N",
  //               createUser: "운영자",
  //               createDatetime: "2024-01-02",
  //             },
  //           ],
  //         },
  //       ];

  //       //
  //       const json = { success: true, data: mockData };

  //       if (json.success && Array.isArray(json.data)) {
  //         const rows = json.data.map((entry, index) => {
  //           const items = entry.press || [];
  //           const koItem = items.find((i) => i.lang === "ko") || {};
  //           const enItem = items.find((i) => i.lang === "en") || {};

  //           return {
  //             originalIndex: index,
  //             pmId: entry.pmId,
  //             pid_ko: koItem.pid || null,
  //             pid_en: enItem.pid || null,

  //             occupancy: entry.rownum || 0,
  //             name: "-", // 카테고리 없음
  //             language:
  //               koItem.lang && enItem.lang ? "both" : koItem.lang ? "ko" : "en",
  //             ko_title: koItem.title || "-",
  //             en_title: enItem.title || "-",
  //             situation: "-",
  //             status: koItem.showYn === "Y" ? "노출" : "비노출",
  //             created_user: koItem.createUser || "-",
  //             created_at: koItem.createDatetime || "-",
  //             _id: `${entry.pmId}`, // 중요: pmId 사용해야 삭제 가능
  //           };
  //         });

  //         // 🔍 필터링 및 정렬
  //         const filtered = rows.filter((row) => {
  //           const titleMatch =
  //             name === "" ||
  //             row.ko_title.includes(name) ||
  //             row.en_title.includes(name);
  //           const categoryMatch = category === "" || row.name === category;
  //           const visibilityMatch =
  //             visibility === "" || row.status === visibility;
  //           const dateMatch =
  //             (!dateRange.startDate ||
  //               new Date(row.created_at) >= new Date(dateRange.startDate)) &&
  //             (!dateRange.endDate ||
  //               new Date(row.created_at) <= new Date(dateRange.endDate));

  //           return titleMatch && categoryMatch && visibilityMatch && dateMatch;
  //         });

  //         const sorted = filtered.sort((a, b) => a.occupancy - b.occupancy);
  //         const start = (page - 1) * size;
  //         const end = start + size;
  //         const sliced = sorted.slice(start, end).map((row, idx) => ({
  //           ...row,
  //           no: start + idx + 1,
  //           _id: `${row.pmId}`, //
  //         }));

  //         setData(sliced);
  //         setTotal(filtered.length);
  //       }
  //     } catch (err) {
  //       console.error("프레스 목록 로딩 실패:", err);
  //     }
  //   };

  //   fetchData();
  // }, [page, name, category, visibility, dateRange, refreshKey]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) => {
      const newChecked = checked ? [...prev, id] : prev.filter((v) => v !== id);
      console.log("현재 체크된 _id 목록:", newChecked);
      return newChecked;
    });
  };

  return (
    <div>
      <SearchSection>
        <Box>
          <Row>
            <Col>
              <Select
                label="카테고리"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">전체</option>
                <option value="이벤트">이벤트</option>
                <option value="프로모션">프로모션</option>
              </Select>
            </Col>
            <p className="text-sm font-medium">게시글 등록일</p>
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={({ startDate, endDate }) =>
                setDateRange({ startDate, endDate })
              }
            />
            <Col>
              <Input
                id={nameId}
                label={"타이틀"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onClear={() => setName("")}
              />
            </Col>

            <span className="flex items-center text-sm font-medium whitespace-nowrap text-gray-800">
              노출 여부
            </span>
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

            <Col className="self-end">
              <Button
                onClick={() => {
                  setPage(1);
                  setSearchParams({ name, category, visibility, page: 1 });
                }}
              >
                검색
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

              console.log("삭제할 pmId 목록:", idsToDelete);

              try {
                const res = await api.post("/api/v1/press/delete", {
                  checkArr: idsToDelete,
                });

                if (res.status === 200) {
                  alert("삭제가 완료되었습니다.");
                  setCheckedIds([]);
                  setPage(1);
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
                  <div className="py-1 font-medium">ko</div>
                  <div className="py-1 font-medium">en</div>
                </div>
              ),
            },
            {
              key: "title",
              label: "타이틀",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <button
                    className="text-black-600 underline"
                    onClick={() =>
                      navigate(`/contents/whatson/media/${row.pmId}?lang=ko`)
                    }
                  >
                    {row.ko_title}
                  </button>
                  <button
                    className="text-black-600 underline"
                    onClick={() =>
                      navigate(`/contents/whatson/media/${row.pmId}?lang=en`)
                    }
                  >
                    {row.en_title}
                  </button>
                </div>
              ),
            },
            { key: "status", label: "노출여부" },
            { key: "created_user", label: "등록자" },
            { key: "created_at", label: "등록일시" },
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
