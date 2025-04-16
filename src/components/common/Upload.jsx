import api from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { Info, UploadIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { useEffect, useRef, useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";

export default function Upload({
  name,
  label = "파일 업로드",
  accept = "image/*,video/*",
  acceptWith,
  preview = true,
  className = "",
  error,
  defaultValue = null, // { name, size, url }
}) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const { control } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({ name, control, defaultValue });

  const watchedValue = useWatch({
    control: control,
    name: acceptWith || "",
  });

  const accepted = useMemo(() => {
    switch (watchedValue) {
      case "image":
        return "image/png, image/jpeg, image/gif";
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
    if (value?.name && value?.size && value?.url) {
      setLocalFile({ name: value.name, size: value.size });
      setPreviewUrl(value.url);
    }
  }, [value]);

  useEffect(() => {
    if (error && wrapperRef.current) {
      wrapperRef.current?.focus();
    }
  }, [error]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = res.data;
      setLocalFile(selectedFile);

      if (result.url) {
        setPreviewUrl(result.url);
        onChange({
          name: selectedFile.name,
          size: selectedFile.size,
          url: result.url,
        });
      } else {
        console.error("파일 업로드 실패", result);
      }
    } catch (err) {
      console.error("파일 업로드 에러", err);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDelete = () => {
    setLocalFile(null);
    setPreviewUrl(null);
    inputRef.current.value = null;
    onChange(null); // react-hook-form에서 값 제거
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
      </p>

      <div
        className={cn(
          "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-sm text-gray-500",
          previewUrl ? "bg-gray-50" : "bg-gray-100",
          error
            ? "border-red-500 text-red-500 dark:border-red-400"
            : "border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
        )}
        onClick={handleClick}
      >
        {preview && previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="preview"
              className="h-full max-h-32 w-auto object-contain"
            />
            <div className="mt-2 truncate px-2 text-xs text-gray-700 dark:text-gray-300">
              {localFile?.name} ({formatSize(localFile?.size)})
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <UploadIcon size={20} />
            <p className="text-gray-500 dark:text-gray-400">
              {localFile ? localFile.name : "클릭하여 파일 업로드"}
            </p>
          </div>
        )}

        {localFile && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="absolute top-2 right-2 rounded-full bg-white p-1 shadow hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accepted || accept}
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <span className="flex items-center gap-1 pt-1 pl-1 text-xs text-red-500">
          <Info size={14} />
          {error}
        </span>
      )}
    </div>
  );
}
