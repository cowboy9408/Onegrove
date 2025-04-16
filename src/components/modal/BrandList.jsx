import { useEffect, useState } from "react";
import Button from "../common/Button";
import DataTable from "../common/DataTable";
import Input from "../common/Input";
import Select from "../common/Select";
import Box from "../layout/Box";
import Col from "../layout/Col";
import Row from "../layout/Row";

export default function BrandList({ selected, onConfirm, closeModal }) {
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState(selected);

  useEffect(() => {
    // TODO: Fetch DATA
    setItems([
      { _id: 1, category: "Lifewear", brand: "Uniqlo", useYn: "사용" },
      { _id: 2, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 3, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 4, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 5, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 6, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 7, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 8, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 9, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 10, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 11, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 12, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 13, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 14, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 15, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 16, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 17, category: "Woman", brand: "SHESMISS", useYn: "사용" },
      { _id: 18, category: "Woman", brand: "SHESMISS", useYn: "사용" },
    ]);
  }, []);

  useEffect(() => {
    if (onConfirm) {
      onConfirm(items.filter((item) => checked.includes(item._id)));
    }
  }, [items, checked, onConfirm]);

  return (
    <>
      <div className="h-96 overflow-y-scroll">
        <Box>
          <Row>
            <Col>
              <Select label="대표 카테고리" topLabel={false}>
                <option value="">전체</option>
                <option value="">통합</option>
              </Select>
            </Col>
            <Col>
              <Input label="브랜드명" topLabel={false} />
            </Col>
            <Col className="self-end">
              <Button className={"h-12 w-full"}>검색</Button>
            </Col>
          </Row>
        </Box>
        <DataTable
          columns={[
            { key: "category", label: "대표 카테고리" },
            { key: "brand", label: "브랜드명" },
            { key: "useYn", label: "사용여부" },
          ]}
          data={items}
          checkable
          checkedIds={checked}
          onCheck={(id, checked) => {
            setChecked((prev) =>
              checked ? [...prev, id] : prev.filter((v) => v !== id)
            );
          }}
        />
      </div>

      <div className="flex justify-center gap-3 pt-3">
        <button
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={() => setChecked([])}
        >
          초기화
        </button>
        <button
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
          onClick={() => {
            onConfirm(items.filter((item) => checked.includes(item._id)));
            closeModal();
          }}
        >
          추가
        </button>
      </div>
    </>
  );
}
