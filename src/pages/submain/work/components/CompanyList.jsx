import { useState } from "react";
import CompanySelectModal from "@/components/modal/CompanySelectModal";
import Button from "@/components/common/Button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Title from "@/components/layout/Title";

export default function CompanyList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newList = Array.from(selectedCompanies);
    const [movedItem] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, movedItem);

    setSelectedCompanies(newList);
  };

  return (
    <div className="space-y-6 p-6">
      <Title title={`■ Work 입주사 리스트`} />

      <Button onClick={() => setShowModal(true)}>입주사 리스트 관리</Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[700px] rounded-lg bg-white p-6 shadow-lg">
            <CompanySelectModal
              selected={selectedCompanies}
              onConfirm={(selected) => {
                setSelectedCompanies(selected);
                setShowModal(false);
              }}
              closeModal={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
      <h3 className="mt-8 text-lg font-bold">노출 순서</h3>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="company-order">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="mt-4 space-y-2"
            >
              {selectedCompanies.map((item, index) => (
                <Draggable key={item._id} draggableId={item._id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center justify-between gap-2 rounded border bg-white px-4 py-2 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="font-medium">{item.companyName}</span>
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() =>
                          setSelectedCompanies((prev) =>
                            prev.filter((c) => c._id !== item._id)
                          )
                        }
                        className="px-2 text-lg font-bold text-red-500 hover:text-red-700"
                        title="삭제"
                      >
                        &minus;
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
