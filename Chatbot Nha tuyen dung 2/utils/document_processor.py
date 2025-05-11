import os
import re
import json
from typing import List, Dict, Any, Optional
from pypdf import PdfReader

class DocumentProcessor:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def process_document(self, file_path: str) -> List[Dict[str, Any]]:
        file_extension = os.path.splitext(file_path)[1].lower()

        if file_extension == '.pdf':
            text = self._extract_text_from_pdf(file_path)
        elif file_extension in ['.txt', '.md', '.rst']:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            raise ValueError(f"Không hỗ trợ định dạng file: {file_extension}")

        clean_text = self._clean_text(text)
        chunks = self._chunk_text(clean_text)

        file_name = os.path.basename(file_path)
        result = []
        for i, chunk in enumerate(chunks):
            result.append({
                'content': chunk,
                'metadata': {
                    'source': file_name,
                    'chunk_id': i,
                    'file_path': file_path
                }
            })
        return result

    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s.,;:!?()[\]{}"\'-]', '', text)
        return text.strip()

    def _chunk_text(self, text: str) -> List[str]:
        chunks = []
        start = 0
        while start < len(text):
            end = start + self.chunk_size
            if end >= len(text):
                chunk = text[start:]
                chunks.append(chunk)
                break

            paragraph_end = text.rfind('\n\n', start, end)
            sentence_end = text.rfind('. ', start, end)
            word_end = text.rfind(' ', start, end)

            if paragraph_end > start:
                end = paragraph_end
            elif sentence_end > start:
                end = sentence_end + 1
            elif word_end > start:
                end = word_end

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start = end - self.chunk_overlap
            if start <= 0:
                start = end
        return chunks

    def save_chunks_to_json(self, chunks: List[Dict[str, Any]], output_path: Optional[str] = None) -> None:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

#     def process_raw_folder(self, raw_folder: str = "raw", output_folder: str = "processed") -> None:
#         os.makedirs(output_folder, exist_ok=True)
#         for filename in os.listdir(raw_folder):
#             file_path = os.path.join(raw_folder, filename)
#             if not os.path.isfile(file_path):
#                 continue
#             if not filename.lower().endswith(('.pdf', '.txt', '.md', '.rst')):
#                 continue
#             try:
#                 print(f"Đang xử lý: {filename}")
#                 chunks = self.process_document(file_path)
#                 base_name = os.path.splitext(filename)[0]
#                 output_path = os.path.join(output_folder, base_name + ".json")
#                 self.save_chunks_to_json(chunks, output_path)
#                 print(f"✔ Đã lưu: {output_path}")
#             except Exception as e:
#                 print(f"❌ Lỗi khi xử lý {filename}: {e}")

# if __name__ == "__main__":
#     processor = DocumentProcessor(chunk_size=1000, chunk_overlap=200)
#     processor.process_raw_folder("raw", "processed")
