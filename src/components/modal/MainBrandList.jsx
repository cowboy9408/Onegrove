import { useEffect, useState } from "react";
import Button from "../common/Button";
import DataTable from "../common/DataTable";
import Input from "../common/Input";
import Select from "../common/Select";
import Box from "../layout/Box";
import Col from "../layout/Col";
import Row from "../layout/Row";
import useModal from "@/hooks/useModal";
import api from "@/lib/apiClient";

export default function BrandList({ selected = [], onConfirm, closeModal }) {
  const [items, setItems] = useState([]); // 전체 목록
  const [filteredItems, setFilteredItems] = useState([]); // 검색 결과
  const [checked, setChecked] = useState([]);
  const [keyword, setKeyword] = useState(""); // 검색어
  const { showModal } = useModal();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // 선택된 카테고리

  useEffect(() => {
    setChecked(selected.map(String));
  }, [selected]);

  useEffect(() => {
    if (items.length > 0) {
      setFilteredItems(items); // 처음 필터 설정
      setChecked(selected.map(String)); // ensure reset even after brand load
    }
  }, [items]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/v1/brand/category");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("/api/v1/main/brand/list?lang=KO");
        if (res.data?.success && Array.isArray(res.data.data)) {
          const parsed = res.data.data.map((item) => ({
            _id: String(item.brandId),
            id: item.brandId,
            category: item.category || "-",
            brandName: item.name || "-",
          }));

          setItems(parsed);
          setFilteredItems(parsed);
        }
      } catch (err) {
        console.error("브랜드 목록 불러오기 실패:", err);
      }
    };

    fetchBrands();
  }, []);

  const normalize = (str) =>
    (str || "").toLowerCase().trim().replace(/\s/g, "");

  const handleSearch = () => {
    const kw = normalize(keyword);
    const cat = normalize(selectedCategory);

    const result = items.filter((item) => {
      const brandName = normalize(item.brandName);
      const category = normalize(item.category);

      const matchesKeyword = brandName.includes(kw);
      const matchesCategory = !cat || category === cat;

      return matchesKeyword && matchesCategory;
    });

    setFilteredItems(result);
  };

  return (
    <>
      <div className="h-96 overflow-y-scroll">
        <Box>
          <Row>
            <Col>
              <Select
                label="대표 카테고리"
                topLabel={false}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">전체</option>
                {categories.map((cat) => (
                  <option key={cat.code} value={cat.value}>
                    {cat.value}
                  </option>
                ))}
              </Select>
            </Col>
            <Col>
              <Input
                label="브랜드명"
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
                onClick={() => {
                  setKeyword(""); // 검색어 초기화
                  setFilteredItems(items); // 전체 목록으로 초기화
                }}
              >
                초기화
              </Button>
            </Col>
          </Row>
        </Box>

        <DataTable
          columns={[
            { key: "category", label: "대표 카테고리" },
            { key: "brandName", label: "브랜드명" },
          ]}
          data={filteredItems}
          rowKey="key"
          checkable
          checkedIds={checked}
          onCheck={(id, isChecked) => {
            const idStr = String(id);
            setChecked((prev) =>
              isChecked
                ? [...new Set([...prev, idStr])]
                : prev.filter((v) => v !== idStr)
            );
          }}
        />
      </div>

      <div className="flex justify-center gap-3 pt-3">
        <button
          className="rounded-md border px-4 py-2 text-sm text-gray-700"
          onClick={() => setChecked([])}
        >
          초기화
        </button>
        <button
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
          onClick={() => {
            const selectedBrands = items.filter((item) =>
              checked.includes(item._id)
            );

            if (selectedBrands.length > 20) {
              showModal({
                title: "안내",
                children: <p>브랜드는 최대 20개 선택 가능합니다.</p>,
                showCancel: false,
              });
              return;
            }

            onConfirm?.(
              selectedBrands.map((b) => ({
                _id: String(b.id), // 서버로 보낼 brandId
                brand: b.brandName, // 화면 표시용
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
