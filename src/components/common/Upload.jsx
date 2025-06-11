import api from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { id } from "date-fns/locale";
import { Info, UploadIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { useEffect, useRef, useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import useModal from "@/hooks/useModal";

export default function Upload({
  name,
  value: externalValue,
  onChange: externalOnChange,
  label = "파일 업로드",
  readOnly = false,
  accept = "image/*,video/*",
  acceptWith,
  preview = true,
  className = "",
  error,
  required = false,
  defaultValue = null, // { name, size, url }
  classification = "default",
  maxLength,
  showDefaultInfo = false,
  info,
}) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const formContext = useFormContext();
  const control = formContext?.control;
  const {
    field: { value: fieldValue, onChange: fieldOnChange },
  } = useController({ name, control, defaultValue });

  const value = externalValue ?? fieldValue;
  const onChange = externalOnChange ?? fieldOnChange;
  const [localError, setLocalError] = useState("");
  const { showModal } = useModal();

  const watchedValue = useWatch({
    control: control,
    name: acceptWith || "",
  });

  const accepted = useMemo(() => {
    switch (watchedValue) {
      case "image":
        return "image/png, image/jpeg, image/gif, image/webp";
      case "document":
        return ".pdf, .doc, .docx, .txt";
      case "video":
        return "video/mp4, video/webm";
      default:
        return accept;
    }
  }, [watchedValue, accept]);

  const [localFile, setLocalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!value || !value.path) {
      setPreviewUrl(null);
      setLocalFile(null);
      return;
    }

    setPreviewUrl(value.path);
    setLocalFile({
      name: value.name,
      size: value.size,
    });
  }, [value?.path, value?.name, name]);

  useEffect(() => {
    if (error && wrapperRef.current) {
      wrapperRef.current?.focus();
    }
  }, [error]);

  const handleFileChange = async (e) => {
    const fileInput = e.target;
    const selectedFile = fileInput.files[0];

    setLocalFile(null);
    setPreviewUrl(null);

    if (!selectedFile) {
      setLocalError("파일이 선택되지 않았습니다.");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setLocalError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (selectedFile.size > maxSize) {
      showModal({
        title: "업로드 오류",
        message: "20MB가 넘는 이미지는 등록할 수 없습니다.",
        showCancel: false,
      });
      return;
    }

    // 통과한 경우만 처리 시작
    setLocalError(""); // 에러 초기화

    const blobUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(blobUrl);
    setLocalFile(selectedFile);

    onChange({
      name: selectedFile.name,
      size: selectedFile.size,
      url: blobUrl,
    });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("classification", classification);

      // console.log("파일 업로드 시작", selectedFile);
      // console.log("파일 업로드 시작", classification);

      const res = await api.post("/api/v1/file/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const result = res.data;

      if (result.name && result.path) {
        const uploadedFile = {
          id: result.id ?? null,
          originalName: selectedFile.name,
          name: result.name,
          size: result.size,
          extension: "." + selectedFile.name.split(".").pop(),
          mime: result.mime || selectedFile.type,
          classification,
          path: result.path,
          status: value?.id ? "E" : "C",
          field: name,
        };
        onChange(uploadedFile);
      } else {
        setLocalError("파일 업로드에 실패했습니다.");
      }
    } catch (err) {
      console.error("파일 업로드 에러", err);

      if (err?.response?.status === 413) {
        showModal({
          title: "업로드 실패",
          message: "20MB가 넘는 이미지는 등록할 수 없습니다.",
          showCancel: false,
        });
      } else {
        showModal({
          title: "업로드 실패",
          message: "파일 업로드 중 문제가 발생했습니다. 다시 시도해주세요.",
          showCancel: false,
        });
      }
    }
    fileInput.value = null;
  };

  const handleClick = () => {
    console.log("Upload 영역 클릭됨");
    if (readOnly) {
      return;
    }

    if (!inputRef.current) {
      return;
    }

    inputRef.current.click();
  };

  const handleDelete = () => {
    if (readOnly) return;
    setLocalFile(null);
    setPreviewUrl(null);
    inputRef.current.value = null;
    onChange({
      ...value,
      id: null,
      name: null,
      path: null,
      status: "D",
    });
  };

  const formatSize = (size) => {
    if (!size) return "";
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className={cn("w-full", className)} ref={wrapperRef} tabIndex={-1}>
      <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800 dark:text-gray-100">
        {label}
        {required && <span className="text-red-500">*</span>}
      </p>

      {preview && previewUrl && (
        <div className="mb-2 w-full text-center">
          <img
            src={previewUrl}
            alt="preview"
            className="mx-auto h-32 object-contain"
          />
          <div className="mt-1 text-sm text-gray-600">
            {localFile?.name} ({formatSize(localFile?.size)})
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="mt-1 text-xs text-red-500 underline"
          >
            이미지 제거
          </button>
        </div>
      )}

      {/* 업로드 박스 (미리보기 아래에 위치 X) */}
      <div
        className={cn(
          "items-row relative flex h-10 w-full justify-center rounded-md border text-xs",
          readOnly
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
            : "cursor-pointer border-dashed border-gray-300 hover:bg-gray-100"
        )}
        onClick={handleClick}
      >
        <div className="flex flex-row items-center justify-center gap-1">
          <UploadIcon size={20} />
          <p className="text-gray-500">
            {localFile ? "다시 업로드하려면 클릭" : "클릭하여 파일 업로드"}
          </p>
        </div>
      </div>

      <input
        key={name}
        ref={inputRef}
        type="file"
        accept={accepted}
        className="hidden"
        onChange={(e) => {
          // console.log("파일 선택됨"); // 반드시 찍히는지 확인
          handleFileChange(e);
        }}
      />
      {showDefaultInfo && (
        <span className="mt-1 flex items-center gap-1 pl-1 text-xs text-gray-400">
          <Info size={14} />
          {info ||
            (maxLength
              ? `최대 ${maxLength}개까지 업로드 가능`
              : "업로드 가능한 파일을 선택하세요.")}
        </span>
      )}

      {(error || localError) && (
        <span className="flex items-center gap-1 pt-1 pl-1 text-xs text-red-500">
          <Info size={14} />
          {error || localError}
        </span>
      )}
    </div>
  );
}
