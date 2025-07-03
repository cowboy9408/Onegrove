import { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import DataTable from "@/components/common/DataTable";
import api from "@/lib/apiClient";

export default function CompanySelectModal({
  selected = [],
  onConfirm,
  closeModal,
}) {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [checked, setChecked] = useState(() => selected.map(String));

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/api/v1/work/companyList?lang=KO");
        const raw = res?.data?.data || [];

        const mapped = raw.map((item) => ({
          _id: String(item.id), // 체크박스에서 쓰기 위해 문자열 변환
          companyName: item.name,
        }));

        setCompanies(mapped);
        setFiltered(mapped);
      } catch (err) {
        console.error("입주사 목록 로딩 실패:", err);
      }
    };

    fetchCompanies();
  }, []);

  const handleSearch = () => {
    const kw = keyword.trim().toLowerCase();
    setFiltered(
      companies.filter((c) => (c.companyName || "").toLowerCase().includes(kw))
    );
  };

  const handleReset = () => {
    setKeyword("");
    setFiltered(companies);
    setChecked([]);
  };

  return (
    <div>
      {/* 검색 영역 */}
      <div className="mb-4 flex gap-2">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="입주사명 입력"
        />
        <Button onClick={handleSearch}>검색</Button>
      </div>

      {/* 테이블 */}
      <DataTable
        columns={[{ key: "companyName", label: "입주사명" }]}
        data={filtered}
        checkable
        checkedIds={checked}
        onCheck={(id, isChecked) => {
          setChecked((prev) =>
            isChecked ? [...prev, id] : prev.filter((v) => v !== id)
          );
        }}
      />

      {/* 하단 버튼 */}
      <div className="mt-4 flex justify-center gap-3">
        <Button variant="white" onClick={handleReset}>
          초기화
        </Button>
        <Button
          onClick={() => {
            const selectedData = companies.filter((c) =>
              checked.includes(c._id)
            );
            onConfirm(selectedData);
            closeModal();
          }}
        >
          추가
        </Button>
      </div>
    </div>
  );
}
