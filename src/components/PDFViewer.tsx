import React from "react";

interface Props {
  pdf_url: string;
}

const PDFViewer = ({ pdf_url }: Props) => {
  return (
    <iframe
  src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
  className="w-full h-[70vh] md:h-full border rounded-lg"
  title="PDF Viewer"
/>
  );
};

export default PDFViewer;