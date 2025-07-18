import { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import DataTable from "@/components/common/DataTable";
import api from "@/lib/apiClient";
import { XIcon } from "@/components/ui/x"; // 기존 모달에서 사용하던 아이콘

export default function CompanySelectModal({
  selected = [],
  onConfirm,
  closeModal,
}) {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [checked, setChecked] = useState(() =>
    selected.map((c) => String(c.companyId ?? c.id))
  );

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/api/v1/work/companyList?lang=KO");
        const raw = res?.data?.data || [];

        const mapped = raw.map((item) => ({
          _id: String(item.id),
          id: item.id,
          companyId: item.id,
          companyName: item.name,
          sort: 0,
          delYn: "N",
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
      <div className="mb-2 flex justify-end">
        <XIcon onClick={closeModal} size={15} />
      </div>
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
            const selectedData = companies
              .filter((c) => checked.includes(c._id))
              .map((c, idx) => ({
                companyId: c.companyId ?? c.id,
                id: c.id ?? undefined, // id가 있는 경우만 포함
                companyName: c.companyName ?? "",
                sort: idx + 1,
                delYn: "N",
              }));

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
