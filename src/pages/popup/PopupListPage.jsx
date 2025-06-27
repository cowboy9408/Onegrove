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
import DateRangePicker from "@/components/common/Datepicker";
import Radio from "@/components/common/Radio";
import api from "@/lib/apiClient";

export default function PopupListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [visibility, setVisibility] = useState(""); // 노출 여부
  const [checkedIds, setCheckedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const nameId = useId();

  const size = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/popup", {
          params: {
            page,
            size,
          },
        });

        const list = res.data?.data || [];

        const parsedData = list.map((item) => {
          const contentKo = item.contentList.find((c) => c.lang === "KO") || {};
          const contentEn = item.contentList.find((c) => c.lang === "EN") || {};

          const formatDate = (str) =>
            str && str !== "-" ? str.split(" ")[0] : "-";

          return {
            pmId: item.id, // 상세 링크 등에 사용
            no: item.rownum,

            ko_title: contentKo.title ?? "-",
            en_title: contentEn.title ?? "-",

            status_ko: contentKo.useYn ?? "-",
            status_en: contentEn.useYn ?? "-",

            start_ko: formatDate(contentKo.startDt),
            start_en: formatDate(contentEn.startDt),
            end_ko: formatDate(contentKo.endDt),
            end_en: formatDate(contentEn.endDt),

            created_user_ko: contentKo.createUser ?? "-",
            created_user_en: contentEn.createUser ?? "-",

            created_at_ko: contentKo.createDt?.split(" ")[0] ?? "-",
            created_at_en: contentEn.createDt?.split(" ")[0] ?? "-",
            _id: String(item.id),
          };
        });

        setData(parsedData);
        setTotal(res.data?.pageable?.totalElements || 0);
      } catch (err) {
        console.error("팝업 리스트 로딩 실패:", err);
      }
    };

    fetchData();
  }, [page, refreshKey]);

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
              <Select label={"입주사"}>
                <option value="">전체</option>
                <option value="">입주사1</option>
                <option value="">입주사2</option>
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

            <Col className="flex gap-2 self-end">
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
              navigate("/popup/regist");
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

              const confirmDelete =
                window.confirm("선택한 팝업을 삭제하시겠습니까?");
              if (!confirmDelete) return;

              try {
                const res = await api.post(
                  "/api/v1/popup/delete",
                  checkedIds.map(Number)
                );

                if (res.status === 200) {
                  alert("삭제가 완료되었습니다.");
                  setCheckedIds([]);
                  setPage(1);
                  setRefreshKey((prev) => prev + 1);
                } else {
                  alert("삭제 실패: 서버 오류");
                }
              } catch (err) {
                console.error("팝업 삭제 요청 실패:", err);
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
                  <div className="p-2 font-medium">KO</div>
                  <div className="p-2 font-medium">EN</div>
                </div>
              ),
            },

            {
              key: "title",
              label: "타이틀",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <button
                    className={`text-black-600 truncate p-2 text-left ${row.ko_title !== "-" ? "underline" : ""}`}
                    onClick={() =>
                      navigate(`/popup/regist/${row.pmId}?lang=ko`)
                    }
                  >
                    {row.ko_title}
                  </button>
                  <button
                    className={`text-black-600 truncate p-2 text-left ${row.en_title !== "-" ? "underline" : ""}`}
                    onClick={() =>
                      navigate(`/popup/regist/${row.pmId}?lang=en`)
                    }
                  >
                    {row.en_title}
                  </button>
                </div>
              ),
            },

            {
              key: "status",
              label: "노출 여부",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.status_ko}</div>
                  <div className="p-2">{row.status_en}</div>
                </div>
              ),
            },
            {
              key: "startDt",
              label: "시작일",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.start_ko}</div>
                  <div className="p-2">{row.start_en}</div>
                </div>
              ),
            },
            {
              key: "endDt",
              label: "종료일",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.end_ko}</div>
                  <div className="p-2">{row.end_en}</div>
                </div>
              ),
            },
            {
              key: "created_at",
              label: "등록일시",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.created_at_ko}</div>
                  <div className="p-2">{row.created_at_en}</div>
                </div>
              ),
            },

            {
              key: "created_user",
              label: "등록자",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-2">{row.created_user_ko}</div>
                  <div className="p-2">{row.created_user_en}</div>
                </div>
              ),
            },
          ]}
          data={data}
          link={{ base: "/popup/regist", path: "pmId" }}
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
