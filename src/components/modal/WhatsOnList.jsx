import { useEffect, useState } from "react";
import Button from "../common/Button";
import DataTable from "../common/DataTable";
import Input from "../common/Input";
import Select from "../common/Select";
import Box from "../layout/Box";
import Col from "../layout/Col";
import Row from "../layout/Row";
import api from "@/lib/apiClient";

export default function WhatsOnList({ selected, onConfirm, closeModal }) {
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState(() => selected.map((s) => String(s)));
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/v1/main/content/category");
        const json = res.data;
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data); // [{ code, value }]
        }
      } catch (error) {
        console.error("카테고리 불러오기 실패:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/main/content/list?lang=KO");
        const json = res.data;
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((item) => ({
            _id: String(item.contentId),
            menu: item.category,
            title: item.title,
            categoryCode: item.categoryCode,
            begin_at: item.startDt,
            end_at: item.endDt,
            useYn: "사용", // 혹시 사용 여부 필드가 필요 없다면 삭제 가능
          }));
          setItems(mapped);
          setFilteredItems(mapped);
        }
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    fetchData();
  }, []);

  const normalize = (str) =>
    (str || "").toLowerCase().trim().replace(/\s/g, "");

  const handleSearch = () => {
    const kw = normalize(keyword);
    const cat = normalize(selectedCategory);

    const result = items.filter((item) => {
      const title = normalize(item.title);
      const category = normalize(item.categoryCode);

      const matchesKeyword = title.includes(kw);
      const matchesCategory = !cat || category === cat;

      return matchesKeyword && matchesCategory;
    });

    setFilteredItems(result);
  };

  const handleReset = () => {
    setKeyword("");
    setSelectedCategory("");
    setFilteredItems(items);
  };

  return (
    <>
      <div className="h-96 overflow-y-scroll">
        <Box>
          <Row>
            <Col>
              <Select
                label="메뉴명"
                topLabel={false}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">전체</option>
                {categories.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.value}
                  </option>
                ))}
              </Select>
            </Col>
            <Col>
              <Input
                placeholder="타이틀을 입력해 주세요."
                topLabel={false}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Col>
            <Col className="flex gap-2 self-end">
              <Button className="h-12 w-full" onClick={handleSearch}>
                검색
              </Button>
              <Button
                className="h-12 w-full bg-gray-200 text-black"
                onClick={handleReset}
              >
                초기화
              </Button>
            </Col>
          </Row>
        </Box>
        <DataTable
          columns={[
            { key: "menu", label: "메뉴명" },
            { key: "title", label: "타이틀" },
            { key: "begin_at", label: "시작일" },
            { key: "end_at", label: "종료일" },
            { key: "useYn", label: "사용여부" },
          ]}
          data={filteredItems}
          checkable
          checkedIds={checked.map(String)}
          onCheck={(id, checked) => {
            setChecked(checked ? [id] : []);
          }}
        />
      </div>

      <div className="flex justify-center gap-3">
        <button
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={() => setChecked([])}
        >
          초기화
        </button>
        <button
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
          onClick={() => {
            onConfirm(
              items
                .filter((item) => checked.includes(String(item._id)))
                .map((item) => ({
                  _id: item._id,
                  title: item.title,
                  categoryCode: item.categoryCode,
                }))
            );
            closeModal();
          }}
        >
          추가
        </button>
      </div>
    </>
  );
}
