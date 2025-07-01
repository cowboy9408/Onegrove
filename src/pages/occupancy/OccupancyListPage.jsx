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
import Radio from "@/components/common/Radio";
import api from "@/lib/apiClient";

export default function OccupancyListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkedIds, setCheckedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [officeOptions, setOfficeOptions] = useState([]);
  const [officeMap, setOfficeMap] = useState({}); // code → label 매핑

  const size = 30;

  const defaultFilter = {
    name: "",
    office: "",
    floor: "",
    status: "",
  };
  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) => {
      return checked ? [...prev, id] : prev.filter((v) => v !== id);
    });
  };

  useEffect(() => {
    const fetchOfficeOptions = async () => {
      try {
        const res = await api.get("/api/v1/company/office/list");
        if (res.data.success && Array.isArray(res.data.data)) {
          const map = {};
          res.data.data.forEach((opt) => {
            map[opt.code] = opt.value;
          });
          setOfficeOptions(res.data.data);
          setOfficeMap(map);
        }
      } catch (err) {
        console.error("오피스 코드 목록 불러오기 실패:", err);
      }
    };
    fetchOfficeOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/company", {
          params: { page, size },
        });

        const result = res.data?.data || [];

        //
        const filtered = result.filter((item) => {
          const koContent = item.contentList.find((c) => c.lang === "KO") || {};
          const officeNames = item.officeList
            .map((o) => officeMap[o.office] || o.office)
            .join(", ");

          // const floorNames = item.officeList.map((o) => o.floor).join(", ");
          const inputFloor = activeFilter.floor.replace(/[^0-9]/g, "");
          const inputNumber = parseInt(inputFloor, 10);

          const nameMatch =
            !activeFilter.name ||
            koContent.companyName?.includes(activeFilter.name);

          const officeMatch =
            !activeFilter.office || officeNames.includes(activeFilter.office);

          const floorMatch =
            !activeFilter.floor ||
            item.officeList.some((o) => {
              const raw = o.floor || "";

              // 숫자만 추출
              const rangeMatch = raw.match(/^(\d+)\s*[-~]\s*(\d+)(F)?$/);

              const singleMatch = raw.match(/^(\d+)(F)?$/);

              if (rangeMatch) {
                const start = parseInt(rangeMatch[1], 10);
                const end = parseInt(rangeMatch[2], 10);
                return inputNumber >= start && inputNumber <= end;
              } else if (singleMatch) {
                const value = parseInt(singleMatch[1], 10);
                return inputNumber === value;
              } else {
                return false;
              }
            });

          const statusMatch =
            !activeFilter.status || item.useYn === activeFilter.status;

          return nameMatch && officeMatch && floorMatch && statusMatch;
        });

        const formatted = filtered.map((item) => {
          const koContent = item.contentList.find((c) => c.lang === "KO") || {};
          const enContent = item.contentList.find((c) => c.lang === "EN") || {};
          const officeNames = item.officeList
            .map((o) => officeMap[o.office] || o.office)
            .join(", ");
          const floorNames = item.officeList.map((o) => o.floor).join(", ");

          return {
            _id: item.id,
            id: item.id,
            no: item.rownum,
            ko_title: koContent.companyName || "-",
            en_title: enContent.companyName || "-",
            occupancy: "-",
            office: officeNames || "-",
            floor: floorNames || "-",
            phone: item.tel || "-",
            status: item.useYn === "Y" ? "사용" : "미사용",
            created_user: koContent.userName || "-",
            created_at: koContent.createDt?.split(" ")[0] || "-",
          };
        });

        setData(formatted);
        setTotal(filtered.length);
      } catch (err) {
        console.error("입주사 목록 불러오기 실패:", err);
      }
    };

    fetchData();
  }, [page, refreshKey, officeMap]);

  return (
    <div>
      <SearchSection>
        <Box>
          <Row className="items-end gap-8">
            <Col className="flex flex-col">
              <label className="mb-1 text-sm font-medium">입주사명</label>
              <Input
                placeholder="입주사명을 입력하세요"
                value={searchFilter.name}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, name: e.target.value })
                }
              />
            </Col>

            <Col className="flex flex-col">
              <label className="mb-1 text-sm font-medium">오피스</label>
              <Select
                value={searchFilter.office}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, office: e.target.value })
                }
              >
                <option value="">전체</option>
                <option value="OFFICE A">OFFICE A</option>
                <option value="OFFICE B">OFFICE B</option>
                <option value="OFFICE C">OFFICE C</option>
                <option value="OFFICE D">OFFICE D</option>
              </Select>
            </Col>

            <Col className="flex flex-col">
              <label className="mb-1 text-sm font-medium">층수</label>
              <Input
                placeholder="예: 3F"
                value={searchFilter.floor}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, floor: e.target.value })
                }
              />
            </Col>

            <Col className="flex flex-col">
              <label className="mb-7 text-sm font-medium">사용 여부</label>
              <div className="relative -top-[15px] mt-0 flex gap-4">
                <Radio
                  name="status"
                  value="Y"
                  label="사용"
                  checked={searchFilter.status === "Y"}
                  onChange={() =>
                    setSearchFilter({ ...searchFilter, status: "Y" })
                  }
                />
                <Radio
                  name="status"
                  value="N"
                  label="미사용"
                  checked={searchFilter.status === "N"}
                  onChange={() =>
                    setSearchFilter({ ...searchFilter, status: "N" })
                  }
                />
              </div>
            </Col>

            <Col className="flex gap-2 self-end">
              <Button
                onClick={() => {
                  setPage(1);
                  setActiveFilter(searchFilter);
                  setRefreshKey((prev) => prev + 1);
                }}
              >
                검색
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchFilter(defaultFilter);
                  setActiveFilter(defaultFilter);
                  setPage(1);
                  setRefreshKey((prev) => prev + 1);
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
              navigate("/occupancy/regist"); // 이동할 경로를 원하는 대로 변경하세요
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

              const confirmed =
                window.confirm("선택한 입주사를 삭제하시겠습니까?");
              if (!confirmed) return;

              try {
                const res = await api.post(
                  "/api/v1/company/delete",
                  checkedIds
                );

                if (res.status === 200) {
                  alert("삭제가 완료되었습니다.");
                  setCheckedIds([]);
                  setPage(1); // 첫 페이지로 이동
                  setRefreshKey((prev) => prev + 1);
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
              key: "occupancy",
              label: "입주사명",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <button
                    className={`text-black-600 truncate p-2 text-left ${row.ko_title !== "-" && row.ko_title !== null && "underline"}`}
                    onClick={() =>
                      navigate(`/occupancy/detail/${row.id}?lang=ko`)
                    }
                  >
                    {row.ko_title}
                  </button>
                  <button
                    className={`text-black-600 truncate p-2 text-left ${row.en_title !== "-" && row.en_title !== null && "underline"}`}
                    onClick={() =>
                      navigate(`/occupancy/detail/${row.id}?lang=en`)
                    }
                  >
                    {row.en_title}
                  </button>
                </div>
              ),
            },
            { key: "office", label: "오피스" },
            { key: "floor", label: "층수" },
            { key: "phone", label: "입주자 연락처" },
            { key: "status", label: "사용 여부" },
            { key: "created_user", label: "등록자" },
            { key: "created_at", label: "등록일자" },
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
