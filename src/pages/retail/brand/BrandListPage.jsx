import { useEffect,useId,useState} from "react";
import { useNavigate,useSearchParams} from "react-router-dom";
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

export default function BrandListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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
    const saved = localStorage.getItem("brands");
    if (!saved) return;
  
    try {
      const parsed = JSON.parse(saved);
      const rows = parsed.map((brand, idx) => {
        const ko = brand.ko || {};
        return {
          _id: String(idx),
          id: idx,
          no: idx + 1,
          category: ko.office || "-",
          name: ko.companyName || "-",
          status: ko.useStatus === "active" ? "사용" : "미사용",
          created_at: ko.created_at?.split("T")[0] || "-",
          created_user: "관리자",
          updated_at: ko.updated_at?.split("T")[0] || "-",
          updated_user: "관리자"
        };
      });
  
      const filtered = rows.filter((row) => {
        const nameMatch = name === "" || row.name.includes(name);
        const categoryMatch = category === "" || row.category === category;
        const statusMatch = status === "" || row.status === (status === "active" ? "사용" : "미사용");
        return nameMatch && categoryMatch && statusMatch;
      });
  
      const start = (page - 1) * size;
      const sliced = filtered.slice(start, start + size);
      setData(sliced);
      setTotal(filtered.length);
    } catch (err) {
      console.error("필터링 오류:", err);
    }
  }, [name, category, status, page, refreshKey]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  };

  const handleDelete = () => {
    const confirm = window.confirm("선택한 브랜드를 삭제하시겠습니까?");
    if (!confirm) return;
  
    const saved = localStorage.getItem("brands");
    if (!saved) return;
  
    try {
      const parsed = JSON.parse(saved);
  
      // _id는 String으로 저장돼 있음
      const remaining = parsed.filter((_, idx) => !checkedIds.includes(String(idx)));
  
      localStorage.setItem("brands", JSON.stringify(remaining));
      setCheckedIds([]); // 체크 초기화
      setPage(1); // 페이지 리셋
      setName(""); // 검색 조건 초기화해도 됨
      setCategory("");
      setStatus("");
      setRefreshKey((prev) => prev + 1);

      // 강제 재실행 (state 변경 트리거)
      setTotal(remaining.length);
    } catch (err) {
      console.error("삭제 오류:", err);
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

      <div className="flex items-center justify-between mb-4">
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
    { key: "updated_user", label: "수정자" }
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
