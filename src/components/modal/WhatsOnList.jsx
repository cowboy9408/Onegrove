import { useEffect, useState } from "react";
import Button from "../common/Button";
import DataTable from "../common/DataTable";
import Input from "../common/Input";
import Select from "../common/Select";
import Box from "../layout/Box";
import Col from "../layout/Col";
import Row from "../layout/Row";

export default function WhatsOnList({ selected, onConfirm, closeModal }) {
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState(selected);

  useEffect(() => {
    // TODO: Fetch DATA
    setItems([
      {
        _id: 1,
        menu: "Event&Promotion",
        title: "버거킹 모든 고객에게 쿠폰 무료 증정",
        begin_at: "2025-05-01",
        end_at: "2025-05-31",
        useYn: "사용",
      },
      {
        _id: 2,
        menu: "Stories of One Grove",
        title: "원그로브 소식을 가장 빠르게 만나는 법",
        begin_at: "2025-05-01",
        end_at: "2025-05-31",
        useYn: "사용",
      },
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
              <Select label="메뉴명" topLabel={false}>
                <option value="">Event&Promotion</option>
                <option value="">Stories of One Grove</option>
              </Select>
            </Col>
            <Col>
              <Input label="타이틀" topLabel={false} />
            </Col>
            <Col className="self-end">
              <Button className={"h-12 w-full"}>검색</Button>
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
