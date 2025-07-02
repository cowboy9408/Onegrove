import { useState, useEffect } from "react";
import Button from "./Button"; // 기존 Button 컴포넌트 사용
import { useFormContext } from "react-hook-form";
import api from "@/lib/apiClient";

export default function OfficeFloorForm({ value = [], readOnly = false }) {
  const { setValue, trigger } = useFormContext();
  const [items, setItems] = useState(
    value.length ? value : [{ office: "cp0101", floor: "" }]
  );
  const [officeOptions, setOfficeOptions] = useState([]);

  useEffect(() => {
    const fetchOfficeOptions = async () => {
      try {
        const res = await api.get("/api/v1/company/office/list");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setOfficeOptions(res.data.data); // { code, value }
        } else {
          console.warn("오피스 데이터 형식 오류");
        }
      } catch (err) {
        console.error("오피스 리스트 호출 실패:", err);
      }
    };

    fetchOfficeOptions();
  }, []);

  useEffect(() => {
    setItems(value.length ? [...value] : [{ office: "cp0101", floor: "" }]);
  }, [JSON.stringify(value)]);

  const updateItems = (newItems) => {
    setItems(newItems);
    setValue("locations", newItems);
    trigger("locations"); // <- 이게 없으면 submit 시 반영되지 않음
  };

  const handleChange = (index, key, val) => {
    if (readOnly) return;
    const visibleItems = items.filter((item) => item.delYn !== "Y");
    const targetItem = visibleItems[index];
    const realIndex = items.findIndex((item) => item === targetItem);
    const newItems = [...items];
    newItems[realIndex][key] = val;
    updateItems(newItems);
  };

  const handleAdd = () => {
    if (readOnly) return;
    const visibleItems = items.filter((item) => item.delYn !== "Y");

    if (visibleItems.length >= 4) {
      alert("오피스는 최대 4개까지만 추가할 수 있습니다.");
      return;
    }

    const newItems = [...items, { office: "", floor: "" }];
    updateItems(newItems);
  };

  const handleRemove = (index) => {
    if (readOnly) return;
    const visibleItems = items.filter((item) => item.delYn !== "Y");
    const itemToRemove = visibleItems[index];
    if (!itemToRemove) return;

    // 삭제 대상의 실제 인덱스 추적
    const newItems = items.map((item) =>
      item === itemToRemove ? { ...item, delYn: "Y" } : item
    );

    // UI 갱신
    setItems(newItems);
    // form 값 갱신 (서버 전송용)
    setValue("locations", newItems);
  };

  return (
    <div className="space-y-4">
      {items
        .filter((item) => item.delYn !== "Y")
        .map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap gap-4 rounded-md border p-4"
          >
            <div className="min-w-[250px] flex-1">
              <label className="mb-1 block text-sm">오피스 선택</label>
              <select
                value={item.office}
                onChange={(e) => handleChange(index, "office", e.target.value)}
                className="w-full rounded border p-2"
                disabled={readOnly}
              >
                {officeOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[250px] flex-1">
              <label className="mb-1 block text-sm">층 수 입력</label>
              <input
                type="text"
                value={item.floor}
                onChange={(e) => handleChange(index, "floor", e.target.value)}
                placeholder="예: 3F, 3~5F"
                className="w-full rounded border p-2"
                disabled={readOnly}
              />
            </div>
            <div className="flex items-end">
              {!readOnly &&
                items.filter((i) => i.delYn !== "Y").length > 1 &&
                index !== 0 && (
                  <Button variant="outline" onClick={() => handleRemove(index)}>
                    삭제
                  </Button>
                )}
            </div>
          </div>
        ))}

      {!readOnly && items.filter((item) => item.delYn !== "Y").length < 4 && (
        <div className="text-right">
          <Button variant="default" onClick={handleAdd}>
            항목 추가
          </Button>
        </div>
      )}
    </div>
  );
}
