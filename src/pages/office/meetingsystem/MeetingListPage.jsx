import Button from "@/components/common/Button";
import DataTable from "@/components/common/DataTableSimple";
import Pagination from "@/components/common/Pagination";
import ResultSummary from "@/components/common/ResultSummary";
import ResultSection from "@/components/layout/ResultSection";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/apiClient";

export default function MeetingListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const size = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/meeting/setting");

        if (res.data.success) {
          const allData = res.data.data;

          const formattedData = allData.map((item) => ({
            no: item.rownum,
            name: (
              <Link
                to={`/system/meeting/detail/${item.id}`}
                className="text-black-600 hover:underline"
              >
                {item.name}
              </Link>
            ),
            roomNumber: item.roomNumber,
            username: item.location,
            capacity: item.capacity,
            isVip: item.isVip,
            createdDt: item.createDatetime || "-", // createdDt 없음 → 대체 문자
            useYn: item.useYn,
            id: item.id,
          }));

          setTotal(formattedData.length);

          // 클라이언트 페이지네이션 처리
          const start = (page - 1) * size;
          const end = start + size;
          setData(formattedData.slice(start, end));
        } else {
          console.error("조회 실패:", res.data.message);
        }
      } catch (error) {
        console.error("API 오류:", error);
      }
    };

    fetchData();
  }, [page]);

  return (
    <div>
      <div className="mt-6 mb-4 flex items-center justify-between">
        <ResultSummary total={total} />

        <div className="flex gap-2">
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              navigate("/system/meeting/regist");
            }}
          >
            추가
          </Button>
        </div>
      </div>
      <ResultSection>
        <DataTable
          columns={[
            { key: "no", label: "번호" },
            { key: "name", label: "회의실 이름", link: true },
            { key: "roomNumber", label: "호실" },
            { key: "username", label: "위치" },
            { key: "capacity", label: "수용 가능 인원" },
            { key: "isVip", label: "회의실 유형" },
            { key: "createdDt", label: "등록일시" }, // 생략 가능
            { key: "useYn", label: "사용여부" },
          ]}
          data={data}
          link={{ base: "/system/meeting", path: "id", key: "name" }}
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
