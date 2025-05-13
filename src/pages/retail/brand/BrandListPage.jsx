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
  const { showModal } = useModal();

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [name, setName] = useState(searchParams.get("name") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [checkedIds, setCheckedIds] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const size = 10;
  const nameId = useId();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("/api/v1/brand", {
          params: {
            currentPage: page,
            category: category || undefined,
            name: name || undefined,
            status: status || undefined,
          },
        });

        const rows = res.data.map((brand, idx) => {
          const ko = brand.contentList.find((c) => c.lang === "KO") || {};
          return {
            _id: String(brand.id),
            id: brand.id,
            no: brand.rownum || (page - 1) * size + idx + 1,
            category: brand.category || "-",
            name: ko.name || "-",
            status: ko.useYn || "-",
            created_at: ko.createDt?.split(" ")[0] || "-",
            created_user: ko.createUser || "-",
            updated_at: ko.updateDt?.split(" ")[0] || "-",
            updated_user: ko.updateUser || "-",
          };
        });

        setData(rows);
        setTotal(res.data.length); // 백엔드에서 총 건수 별도 제공 시 수정 가능
      } catch (err) {
        console.error("브랜드 목록 로딩 실패:", err);
      }
    };

    fetchBrands();
  }, [name, category, status, page, refreshKey]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  };

  const handleDelete = async () => {
    const confirm = window.confirm("선택한 브랜드를 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      await Promise.all(
        checkedIds.map((id) => api.delete(`/brands/${id}`)) // 삭제 관련 api 확인 필요
      );

      setCheckedIds([]);
      setPage(1);
      setName("");
      setCategory("");
      setStatus("");
      setRefreshKey((prev) => prev + 1);
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
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="">전체</option>
                <option value="office1">카테고리1</option>
                <option value="office2">카테고리2</option>
              </Select>
            </Col>

            <Col>
              <Input
                id={nameId}
                label="브랜드명"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onClear={() => setSearchName("")}
              />
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
                onClick={() => {
                  setName(searchName);
                  setCategory(searchCategory);
                  setStatus(searchStatus);
                  setPage(1); //페이지 초기화
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
            { key: "name", label: "브랜드명" },
            { key: "status", label: "사용여부" },
            { key: "created_at", label: "등록일시" },
            { key: "created_user", label: "등록자" },
            { key: "updated_at", label: "수정일시" },
            { key: "updated_user", label: "수정자" },
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
          onChange={setPage}
        />
      </ResultSection>
    </div>
  );
}
