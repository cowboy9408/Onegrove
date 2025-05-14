import { useState } from "react";
import Button from "./Button"; // 기존 Button 컴포넌트 사용

export default function OfficeFloorForm({ value = [], onChange }) {
  const [items, setItems] = useState(
    value.length ? value : [{ office: "", floor: "" }]
  );

  const handleChange = (index, key, val) => {
    const newItems = [...items];
    newItems[index][key] = val;
    setItems(newItems);
    onChange?.(newItems);
  };

  const handleAdd = () => {
    const newItems = [...items, { office: "", floor: "" }];
    setItems(newItems);
    onChange?.(newItems);
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange?.(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex flex-wrap gap-4 rounded-md border p-4">
          <div className="min-w-[250px] flex-1">
            <label className="mb-1 block text-sm">오피스 선택</label>
            <select
              value={item.office}
              onChange={(e) => handleChange(index, "office", e.target.value)}
              className="w-full rounded border p-2"
              required
            >
              <option value="">선택</option>
              <option value="office1">오피스1</option>
              <option value="office2">오피스2</option>
            </select>
          </div>

          <div className="min-w-[250px] flex-1">
            <label className="mb-1 block text-sm">층 수 선택</label>
            <select
              value={item.floor}
              onChange={(e) => handleChange(index, "floor", e.target.value)}
              className="w-full rounded border p-2"
              required
            >
              <option value="">선택</option>
              <option value="1F">1층</option>
              <option value="2F">2층</option>
              <option value="3F">3층</option>
            </select>
          </div>

          <div className="flex items-end">
            {items.length > 1 && (
              <Button variant="outline" onClick={() => handleRemove(index)}>
                삭제
              </Button>
            )}
          </div>
        </div>
      ))}

      {items.length < 4 && (
        <div className="text-right">
          <Button variant="default" onClick={handleAdd}>
            항목 추가
          </Button>
        </div>
      )}
    </div>
  );
}
