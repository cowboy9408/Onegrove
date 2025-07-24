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
import { useSearchParams } from "react-router-dom";
import DateRangePicker from "@/components/common/Datepicker";

import Radio from "@/components/common/Radio";

export default function InquiryListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusType, setStatusType] = useState("상태");
  const [statusKeyword, setStatusKeyword] = useState("");
  const [language, setLanguage] = useState("all"); // 언어 상태

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const nameId = useId();

  const size = 10;

  useEffect(() => {
    const fetchData = async () => {
      // END TODO faker 삭제
    };

    fetchData();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    setActiveFilter(searchFilter);
    const params = {
      name: searchFilter.name,
      category: searchFilter.category,
      visibility: searchFilter.visibility,
      page: 1,
    };
    if (searchFilter.dateRange.startDate) {
      params.startDate = searchFilter.dateRange.startDate
        .toISOString()
        .split("T")[0];
    }
    if (searchFilter.dateRange.endDate) {
      params.endDate = searchFilter.dateRange.endDate
        .toISOString()
        .split("T")[0];
    }
    setSearchParams(params);
  };

  return (
    <div>
      <SearchSection>
        <Box>
          <Row>
            <Col>
              <Select label={"담당 부서"}>
                <option value="">전체</option>
                <option value="">상태1</option>
                <option value="">상태2</option>
              </Select>
            </Col>
            <Col>
              <Select label={"문의 유형"}>
                <option value="">전체</option>
                <option value="">답변1</option>
                <option value="">답변2</option>
              </Select>
            </Col>
            <Col>
              <Select label={"답변상태"}>
                <option value="">전체</option>
                <option value="">답변1</option>
                <option value="">답변2</option>
              </Select>
            </Col>
            <Row className="pb-4">
              <Col>
                <p className="mb-1 text-sm font-medium text-gray-800">언어</p>
                <div className="flex gap-4">
                  <Radio
                    id="lang-all"
                    name="language"
                    value="all"
                    checked={language === "all"}
                    onChange={handleLanguageChange}
                    label="전체"
                  />
                  <Radio
                    id="lang-ko"
                    name="language"
                    value="ko"
                    checked={language === "ko"}
                    onChange={handleLanguageChange}
                    label="국문"
                  />
                  <Radio
                    id="lang-en"
                    name="language"
                    value="en"
                    checked={language === "en"}
                    onChange={handleLanguageChange}
                    label="영문"
                  />
                </div>
              </Col>
            </Row>
            <Row>
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
            </Row>
            <Row>
              <Col>
                <Input
                  label="키워드 검색"
                  selectOptions={["전체", "아이디", "이름"]}
                  selectValue={statusType}
                  onSelectChange={(e) => setStatusType(e.target.value)}
                  inputValue={statusKeyword}
                  onInputChange={(e) => setStatusKeyword(e.target.value)}
                  onClear={() => setStatusKeyword("")}
                />
              </Col>
            </Row>
            <div className="flex w-full justify-end gap-2">
              <Button onClick={handleSearch}>검색</Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchFilter(defaultFilter);
                  setActiveFilter(defaultFilter);
                  setPage(1);
                  setSearchParams({ page: 1 });
                }}
              >
                초기화
              </Button>
            </div>
          </Row>
        </Box>
      </SearchSection>
      <ResultSummary total={total} />
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
