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
import { faker } from "@faker-js/faker";
import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DateRangePicker from "@/components/common/Datepicker";

export default function Visit() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);

  const nameId = useId();
  

  const size = 10;

  useEffect(() => {
    const fetchData = async () => {
      // TODO: faker 삭제
      const generateFakePagedUsers = ({ page = 1, size = 10 }) => {
        const totalElements = 23;
        const totalPages = Math.ceil(totalElements / size);
        const start = (page - 1) * size;

        const data = Array.from({ length: size }, (_, i) => {
          const index = start + i + 1;
          return {
            no: index,
            type: faker.helpers.arrayElement(["관리자", "일반", "외부"]),
            occupancy: faker.company.name(),
            name: faker.person.lastName() + faker.person.firstName(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            status: faker.helpers.arrayElement(["활성", "비활성"]),
            created_user: faker.person.fullName(),
            created_at: faker.date
              .recent({ days: 30 })
              .toISOString()
              .split("T")[0],
          };
        });

        return {
          pageable: {
            totalPages,
            totalElements,
            currentPage: page,
            pageSize: size,
          },
          data: data.slice(0, totalElements - start), // 마지막 페이지 size 조정
        };
      };
      // END TODO faker 삭제

      // TODO: FETCH DATA
      const res = generateFakePagedUsers(page);

      setData(res.data);
      setTotal(res.pageable.totalElements);
    };

    fetchData();
  }, [page]);

  return (
    <div>
      <SearchSection>
        <Box>
          <Row>
            <Col>
              <Select label={"입주사"}>
                <option value="">전체</option>
                <option value="">입주사1</option>
                <option value="">입주사2</option>
              </Select>
            </Col>
            <Col>
              <Select label={"상태"}>
                <option value="">전체</option>
                <option value="">상태1</option>
                <option value="">상태2</option>
              </Select>
            </Col>
            <Col>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={({ startDate, endDate }) => {
            setStartDate(startDate);
            setEndDate(endDate);
          }}
        />
      </Col>
      <Row>
        <Col>
              <Input
                id={nameId}
                label={"방문객"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onClear={() => setName("")}
              />
            </Col>
            </Row>
      
           
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
        // 등록 버튼 클릭 시 로직
      }}
    >
      방문객 추가
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
