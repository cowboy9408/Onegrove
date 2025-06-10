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
import api from "@/lib/apiClient";

export default function AdminListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchStatus, setSearchStatus] = useState("");

  const nameId = useId();
  const emailId = useId();

  const size = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page,
          name,
          email,
          status: searchStatus,
        };

        const response = await api.get("/api/v1/user/admin", { params });
        const res = response.data;

        if (res.success) {
          setData(
            res.data.map((item) => ({
              no: item.rownum,
              _id: item.id,
              type: item.role,
              occupancy: "", // 입주사 없음
              name: item.name,
              username: item.username,
              email: item.email,
              status: item.status,
              valuable: item.isUse,
              created_at: item.createDatetime?.split("T")[0],
            }))
          );
          setTotal(res.data.length); // 실제 total 값이 없으므로 추후 백엔드 개선 필요
        }
      } catch (error) {
        console.error("API 요청 실패:", error);
      }
    };

    fetchData();
  }, [page, name, email, searchStatus]);

  return (
    <div>
      <SearchSection>
        <Box>
          <Row>
            <Col>
              <Select label={"관리자 유형"}>
                <option value="">전체</option>
                <option value="">일반</option>
                <option value="">리테일</option>
                <option value="">오피스</option>
              </Select>
            </Col>
            <Col>
              <Input
                id={nameId}
                label={"이름"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onClear={() => setName("")}
              />
            </Col>
            <Col>
              <Input
                id={emailId}
                label={"아이디"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onClear={() => setName("")}
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
      <div className="mb-4 flex items-center justify-between">
        <ResultSummary total={total} />

        <div className="flex gap-2">
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              navigate("/admin/list/regist");
            }}
          >
            등록
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {}}
          >
            삭제
          </Button>
        </div>
      </div>
      <ResultSection>
        <DataTable
          columns={[
            { key: "no", label: "번호" },
            { key: "type", label: "관리자 유형" },
            { key: "name", label: "이름" },
            { key: "username", label: "아이디" },
            { key: "email", label: "이메일" },
            { key: "status", label: "계정 상태" },
            { key: "valuable", label: "사용 여부" },
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
