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



export default function EventListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkedIds, setCheckedIds] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const [name, setName] = useState(searchParams.get("name") || "");
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
 

const [category, setCategory] = useState("");
const [visibility, setVisibility] = useState(""); // 노출 여부

  const nameId = useId();
  

  const size = 10;

  useEffect(() => {
    const saved = localStorage.getItem("events");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
  
        // 전체 rows 생성 및 정렬
        const rows = parsed.map((event, index) => {
          const ko = event.ko || {};
          const en = event.en || {};
  
          return {
            originalIndex: index,
            occupancy: Number(ko.order) || 0,
            name: ko.category || "-",
            language: event.ko && event.en ? "both" : event.ko ? "ko" : "en",
            ko_title: ko.title || "-",
            en_title: en.title || "-",
            email: "진행중",
            status: ko.status === "active" ? "노출" : "비노출",
            created_user: "관리자",
            created_at: ko.created_at || "-",
          };
        });

        // 검색 필터 적용
      const filtered = rows.filter((row) => {
        const titleMatch = name === "" || row.ko_title.includes(name) || row.en_title.includes(name);
        const categoryMatch = category === "" || row.name === category;
        const visibilityMatch = visibility === "" || row.status === visibility;
        const dateMatch = (!dateRange.startDate || new Date(row.created_at) >= new Date(dateRange.startDate)) &&
                          (!dateRange.endDate || new Date(row.created_at) <= new Date(dateRange.endDate));

        return titleMatch && categoryMatch && visibilityMatch && dateMatch;
      });
  
      const sorted = filtered.sort((a, b) => a.occupancy - b.occupancy);
  
        const start = (page - 1) * size;
        const end = start + size;
        const sliced = sorted.slice(start, end).map((row, idx) => ({
          ...row,
          no: start + idx + 1,
          _id: `${row.originalIndex}`, // 또는 UUID 등도 가능
        }));
  
        setData(sliced);
        setTotal(filtered.length);
      } catch (err) {
        console.error("리스트 파싱 오류:", err);
      }
    }
  }, [page, name, category, visibility, dateRange]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
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
                onChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
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
            
            <span className="flex items-center text-sm font-medium text-gray-800 whitespace-nowrap">
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
<div className="flex items-center justify-between mb-4">
  <ResultSummary total={total} />

  <div className="flex gap-2">
  <Button
  className="bg-black text-white hover:bg-gray-800"
  onClick={() => {
    navigate("/contents/whatson/event/regist"); 
  }}
>
  등록
</Button>
<Button
  className="bg-black text-white hover:bg-gray-800"
  onClick={() => {
    const saved = localStorage.getItem("events");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      // 삭제 대상 ID 집합 만들기
      const idsToDelete = new Set(
        data
          .filter((item) => checkedIds.includes(item._id))
          .map((item) => Number(item.originalIndex))
      );

      // 실제 삭제
      const updated = parsed.filter((_, index) => !idsToDelete.has(index));
      localStorage.setItem("events", JSON.stringify(updated));

      // 삭제 후 바로 목록 재계산
      const rows = updated.map((event, index) => {
        const ko = event.ko || {};
        const en = event.en || {};

        return {
          originalIndex: index,
          _id: `${index}`, // 여기서 다시 _id 보장
          occupancy: Number(ko.order) || 0,
          name: ko.category || "-",
          language: event.ko && event.en ? "both" : event.ko ? "ko" : "en",
          ko_title: ko.title || "-",
          en_title: en.title || "-",
          email: "진행중",
          status: ko.status === "active" ? "노출" : "비노출",
          created_user: "관리자",
          created_at: ko.created_at || "-",
        };
      });

      const filtered = rows.filter((row) => {
        const titleMatch = name === "" || row.ko_title.includes(name) || row.en_title.includes(name);
        const categoryMatch = category === "" || row.name === category;
        const visibilityMatch = visibility === "" || row.status === visibility;
        const dateMatch = (!dateRange.startDate || new Date(row.created_at) >= new Date(dateRange.startDate)) &&
                          (!dateRange.endDate || new Date(row.created_at) <= new Date(dateRange.endDate));
        return titleMatch && categoryMatch && visibilityMatch && dateMatch;
      });

      const sorted = filtered.sort((a, b) => a.occupancy - b.occupancy);
      const start = 0;
      const end = start + 10;
      const sliced = sorted.slice(start, end).map((row, idx) => ({
        ...row,
        no: start + idx + 1,
      }));

      // UI 즉시 갱신
      setData(sliced);
      setTotal(filtered.length);
      setCheckedIds([]);
      setPage(1); // 또는 유지
    } catch (err) {
      console.error("삭제 중 오류:", err);
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
    { key: "occupancy", label: "노출순서" },
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
          <div className="py-1">{row.ko_title}</div>
          <div className="py-1">{row.en_title}</div>
        </div>
      ),  
    },
    { key: "email", label: "상태여부" },
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
