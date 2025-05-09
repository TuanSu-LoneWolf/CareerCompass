import os
import re
import json
from typing import List, Dict, Any, Optional
from pypdf import PdfReader

class DocumentProcessor:
    """
    Lớp xử lý tài liệu từ nhiều định dạng khác nhau (PDF, text, etc.)
    và thực hiện phân đoạn (chunking) cho RAG
    """
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Khởi tạo Document Processor
        
        Args:
            chunk_size: Kích thước mỗi chunk (số ký tự)
            chunk_overlap: Số ký tự chồng lấp giữa các chunk liên tiếp
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def process_document(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Xử lý tài liệu từ đường dẫn file
        
        Args:
            file_path: Đường dẫn đến file cần xử lý
            
        Returns:
            List các chunk đã được xử lý
        """
        # Kiểm tra loại file và sử dụng phương thức phù hợp
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            text = self._extract_text_from_pdf(file_path)
        elif file_extension in ['.txt', '.md', '.rst']:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            raise ValueError(f"Không hỗ trợ định dạng file: {file_extension}")
        
        # Làm sạch văn bản
        clean_text = self._clean_text(text)
        
        # Phân đoạn văn bản
        chunks = self._chunk_text(clean_text)
        
        # Thêm metadata
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
        """
        Trích xuất văn bản từ file PDF
        
        Args:
            pdf_path: Đường dẫn đến file PDF
            
        Returns:
            Văn bản đã trích xuất
        """
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    def _clean_text(self, text: str) -> str:
        """
        Làm sạch văn bản
        
        Args:
            text: Văn bản cần làm sạch
            
        Returns:
            Văn bản đã làm sạch
        """
        # Loại bỏ nhiều dấu xuống dòng liên tiếp
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Loại bỏ khoảng trắng thừa
        text = re.sub(r'\s+', ' ', text)
        
        # Loại bỏ các ký tự đặc biệt không cần thiết
        text = re.sub(r'[^\w\s.,;:!?()[\]{}"\'-]', '', text)
        
        return text.strip()
    
    def _chunk_text(self, text: str) -> List[str]:
        """
        Phân đoạn văn bản thành các chunk nhỏ hơn
        
        Args:
            text: Văn bản cần phân đoạn
            
        Returns:
            List các chunk
        """
        chunks = []
        start = 0
        
        while start < len(text):
            # Lấy đoạn văn bản có độ dài chunk_size
            end = start + self.chunk_size
            
            if end >= len(text):
                chunk = text[start:]
                chunks.append(chunk)
                break
            
            # Tìm vị trí kết thúc câu/đoạn gần nhất
            # Ưu tiên kết thúc theo thứ tự: đoạn văn, câu, từ
            paragraph_end = text.rfind('\n\n', start, end)
            sentence_end = text.rfind('. ', start, end)
            word_end = text.rfind(' ', start, end)
            
            if paragraph_end > start:
                end = paragraph_end
            elif sentence_end > start:
                end = sentence_end + 1  # Bao gồm cả dấu chấm
            elif word_end > start:
                end = word_end
            
            chunk = text[start:end].strip()
            if chunk:  # Chỉ thêm chunk không rỗng
                chunks.append(chunk)
            
            # Di chuyển đến vị trí tiếp theo, trừ đi phần chồng lấp
            start = end - self.chunk_overlap
            
            # Đảm bảo start không bị lùi lại
            if start <= 0:
                start = end
        
        return chunks