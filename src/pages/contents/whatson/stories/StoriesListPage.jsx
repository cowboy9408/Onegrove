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
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function StoriesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [checkedIds, setCheckedIds] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [name, setName] = useState(searchParams.get("name") || "");
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState(""); // 노출 여부

  const nameId = useId();

  const size = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/stories");
        const json = res.data;

        if (Array.isArray(json)) {
          const rows = json.map((item, index) => {
            const koItem = item.contentList.find((i) => i.lang === "KO") || {};
            const enItem = item.contentList.find((i) => i.lang === "EN") || {};

            return {
              originalIndex: item.id,
              _id: String(item.id),
              no: index + 1,
              occupancy: Number(koItem.sort) || 0,
              name: koItem.category || "-",
              language:
                koItem.lang && enItem.lang ? "both" : koItem.lang ? "ko" : "en",
              ko_title: koItem.title || "-",
              en_title: enItem.title || "-",
              email: koItem.status || "진행중",
              status: koItem.showYn || "비노출",
              created_user: koItem.createUser || "-",
              created_at: koItem.createDt || "-",
            };
          });

          // 필터 + 정렬
          const filtered = rows.filter((row) => {
            const titleMatch =
              name === "" ||
              row.ko_title.includes(name) ||
              row.en_title.includes(name);
            const categoryMatch = category === "" || row.name === category;
            const visibilityMatch =
              visibility === "" || row.status === visibility;
            const dateMatch =
              (!dateRange.startDate ||
                new Date(row.created_at) >= new Date(dateRange.startDate)) &&
              (!dateRange.endDate ||
                new Date(row.created_at) <= new Date(dateRange.endDate));

            return titleMatch && categoryMatch && visibilityMatch && dateMatch;
          });

          const sorted = filtered.sort((a, b) => a.occupancy - b.occupancy);
          const start = (page - 1) * size;
          const end = start + size;
          const sliced = sorted.slice(start, end).map((row, idx) => ({
            ...row,
            no: start + idx + 1,
          }));

          setData(sliced);
          setTotal(filtered.length);
        }
      } catch (err) {
        console.error("스토리 목록 불러오기 실패:", err);
      }
    };

    fetchData();
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
              onChange={({ startDate, endDate }) =>
                setDateRange({ startDate, endDate })
              }
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
      <div className="mb-4 flex items-center justify-between">
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
              if (checkedIds.length === 0) return;
              console.log("삭제 버튼 클릭됨");
              showModal({
                title: "스토리 삭제 확인",
                message: "정말 삭제하시겠습니까?",
                showCancel: true,
                confirmButton: "삭제",
                onConfirm: async () => {
                  try {
                    await api.post("/api/v1/stories/delete", {
                      ids: checkedIds.map((id) => Number(id)),
                    });
                    setCheckedIds([]);
                    setPage(1);
                  } catch (err) {
                    console.error("삭제 실패:", err);
                  }
                },
              });
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
