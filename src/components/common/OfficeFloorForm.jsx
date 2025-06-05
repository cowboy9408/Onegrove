import { useState, useEffect } from "react";
import Button from "./Button"; // 기존 Button 컴포넌트 사용
import { useFormContext } from "react-hook-form";

export default function OfficeFloorForm({ value = [] }) {
  const { setValue } = useFormContext();
  const [items, setItems] = useState(
    value.length ? value : [{ office: "", floor: "" }]
  );

  useEffect(() => {
    const isSame = JSON.stringify(value) === JSON.stringify(items);
    if (!isSame && value.length <= 4) {
      setItems(value.length ? [...value] : [{ office: "", floor: "" }]);
    }
  }, [value]);

  const updateItems = (newItems) => {
    setItems(newItems);
    setValue("locations", newItems);
  };

  const handleChange = (index, key, val) => {
    const newItems = [...items];
    newItems[index][key] = val;
    updateItems(newItems);
  };

  const handleAdd = () => {
    if (items.length >= 4) {
      alert("오피스는 최대 4개까지만 추가할 수 있습니다.");
      return;
    }
    const newItems = [...items, { office: "", floor: "" }];
    updateItems(newItems);
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    updateItems(newItems);
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
              <option value="A">A</option>
              <option value="B">B</option>
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
              <option value="1F">1F</option>
              <option value="2F">2F</option>
              <option value="3F">3F</option>
              <option value="4F">4F</option>
              <option value="5F">5F</option>
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
