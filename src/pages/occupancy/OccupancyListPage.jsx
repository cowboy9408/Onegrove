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
  const [searchStatus, setSearchStatus] = useState("");

  const size = 10;

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) => {
      return checked ? [...prev, id] : prev.filter((v) => v !== id);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/company", {
          params: { page, size },
        });

        const result = res.data?.data || [];

        const formatted = result.map((item) => {
          const koContent = item.contentList.find((c) => c.lang === "KO") || {};
          const enContent = item.contentList.find((c) => c.lang === "EN") || {};
          const officeNames = item.officeList.map((o) => o.office).join(", ");
          const floorNames = item.officeList.map((o) => o.floor).join(", ");

          return {
            _id: item.id, // ← 버튼에서 사용됨
            id: item.id,
            no: item.rownum,
            ko_title: koContent.companyName || "-",
            en_title: enContent.companyName || "-",
            occupancy: "-", // 필요 없다면 삭제 가능
            office: officeNames || "-",
            floor: floorNames || "-",
            phone: item.tel || "-",
            status: item.useYn === "Y" ? "사용" : "미사용",
            created_user: koContent.userName || "-",
            created_at: koContent.createDt?.split(" ")[0] || "-", // 날짜만
          };
        });

        setData(formatted);
        setTotal(res.data?.pageable?.totalElements || 0);
      } catch (err) {
        console.error("입주사 목록 불러오기 실패:", err);
      }
    };

    fetchData();
  }, [page, refreshKey]);

  return (
    <div>
      <SearchSection>
        <Box>
          <Row>
            <Col>
              <Select label={"입주사명"}>
                <option value="">전체</option>
                <option value="">입주사1</option>
                <option value="">입주사2</option>
              </Select>
            </Col>
            <Col>
              <Select label={"오피스"}>
                <option value="">전체</option>
                <option value="">오피스1</option>
                <option value="">오피스2</option>
              </Select>
            </Col>
            <Col>
              <Select label={"충"}>
                <option value="">전체</option>
                <option value="">1층</option>
                <option value="">2층</option>
                <option value="">3층</option>
                <option value="">4층</option>
                <option value="">5층</option>
                <option value="">6층</option>
                <option value="">7층</option>
              </Select>
            </Col>
            <Col className="flex items-center gap-4">
              <span className="text-sm font-medium">사용 여부</span>
              <Radio
                name="status"
                value="active"
                label="사용"
                checked={searchStatus === "active"}
                onChange={() => setSearchStatus("active")}
              />
              <Radio
                name="status"
                value="inactive"
                label="미사용"
                checked={searchStatus === "inactive"}
                onChange={() => setSearchStatus("inactive")}
              />
            </Col>
            <Col className="self-end">
              <Button
                className={"h-12 w-full"}
                onClick={() => {
                  setSearchParams({ name, page });
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
            { key: "", label: "사용 여부" },
            { key: "created_user", label: "등록일자" },
            { key: "created_at", label: "등록자" },
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
