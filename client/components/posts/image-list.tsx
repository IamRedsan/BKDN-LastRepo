import React, { useState, useEffect } from "react";

interface ImageFile {
  file: File | { url: string };
  url: string;
}

interface ImageListProps {
  files: (File | { url: string })[];
  setFiles: React.Dispatch<React.SetStateAction<(File | { url: string })[]>>;
  isEditable: boolean;
}

const ImageList: React.FC<ImageListProps> = ({
  files,
  setFiles,
  isEditable,
}) => {
  const [listImage, setListImage] = useState<ImageFile[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      const newImages = files.map((file) => {
        const url = "url" in file ? file.url : URL.createObjectURL(file);
        return { file, url };
      });
      setListImage(newImages);
    }
  }, [files]);

  const handleRemoveImage = (index: number) => {
    const newList = listImage.filter((_, i) => i !== index);
    setListImage(newList);

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2">
        {listImage.map((img, index) => (
          <div
            className="relative flex-shrink-0 w-[300px] h-[200px] overflow-hidden rounded-lg"
            key={index}
          >
            <img
              className="w-full h-full object-cover"
              src={img.url}
              alt={`img-${index}`}
            />
            {isEditable && (
              <button
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/80 text-white flex items-center justify-center"
                onClick={() => handleRemoveImage(index)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageList;
