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

export default function UserListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const nameId = useId();
  // const emailId = useId();

  const size = 10;

  useEffect(() => {
    const saved = localStorage.getItem("brands");
    if (!saved) return;
  
    try {
      const parsed = JSON.parse(saved);
      const start = (page - 1) * size;
      const sliced = parsed.slice(start, start + size).map((brand, idx) => ({
        no: start + idx + 1,
        name: brand.companyName || "-",
        occupancy: brand.office || "-",
        username: brand.ceoName || "-",
        email: brand.phone || "-",
        status: brand.useStatus === "active" ? "활성" : "비활성",
        created_user: "관리자",
        created_at: brand.created_at?.split("T")[0] || "-",
      }));
  
      setData(sliced);
      setTotal(parsed.length);
    } catch (err) {
      console.error("브랜드 리스트 파싱 오류:", err);
    }
  }, [page]);

  return (
    <div>
      <SearchSection>
        <Box>
          <Row>
            <Col>
              <Select label={"카테고리"}>
                <option value="">전체</option>
                <option value="">카테고리1</option>
                <option value="">카테고리2</option>
              </Select>
            </Col>
            <Col>
              <Input
                id={nameId}
                label={"브랜드명"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onClear={() => setName("")}
              />
            </Col>
    
            <Col className="self-end">
              <Button
                className={"h-12 w-full"}
                onClick={() => {
                  setSearchParams({ name, email, page });
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
          onClick={() => {
            navigate("/retail/brand/regist");
          }}
        >
          등록
        </Button>
    <Button
      className="bg-black text-white hover:bg-gray-800"
      onClick={() => {
        // 삭제 버튼 클릭 시 로직
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
            { key: "occupancy", label: "입주사" },
            { key: "name", label: "이름" },
            { key: "username", label: "아이디" },
            { key: "email", label: "이메일" },
            { key: "status", label: "계정 상태" },
            { key: "", label: "사용 여부" },
            { key: "created_user", label: "등록자" },
            { key: "created_at", label: "등록일시" },
          ]}
          data={data}
          link={{ base: "/admin", path: "no" }}
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
