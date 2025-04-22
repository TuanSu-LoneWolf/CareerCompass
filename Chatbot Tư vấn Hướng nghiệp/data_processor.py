import os
import re
import fitz  # PyMuPDF
import docx
import nltk
from nltk.tokenize import sent_tokenize

# Download NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class DataProcessor:
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def process_file(self, file_path):
        """Xử lý file dựa trên định dạng"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {file_path} không tồn tại")
        
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self._process_pdf(file_path)
        elif file_ext == '.txt':
            return self._process_txt(file_path)
        elif file_ext == '.docx':
            return self._process_docx(file_path)
        else:
            raise ValueError(f"Định dạng file {file_ext} không được hỗ trợ")
    
    def _process_pdf(self, file_path):
        """Xử lý file PDF"""
        chunks = []
        try:
            # Mở PDF
            doc = fitz.open(file_path)
            full_text = ""
            
            # Trích xuất văn bản theo từng trang
            for page_num, page in enumerate(doc):
                page_text = page.get_text()
                
                # Loại bỏ khoảng trắng thừa và ký tự đặc biệt
                page_text = self._clean_text(page_text)
                
                if page_text.strip():  # Nếu còn nội dung sau khi làm sạch
                    # Chia thành các chunks
                    page_chunks = self._text_to_chunks(page_text)
                    
                    for chunk in page_chunks:
                        chunks.append({
                            'text': chunk,
                            'source': os.path.basename(file_path),
                            'page': page_num + 1
                        })
            
            return chunks
        except Exception as e:
            print(f"Lỗi khi xử lý PDF {file_path}: {str(e)}")
            return []
    
    def _process_txt(self, file_path):
        """Xử lý file TXT"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Làm sạch văn bản
            text = self._clean_text(text)
            
            # Chia thành các chunks
            text_chunks = self._text_to_chunks(text)
            
            return [{'text': chunk, 'source': os.path.basename(file_path)} for chunk in text_chunks]
        except Exception as e:
            print(f"Lỗi khi xử lý TXT {file_path}: {str(e)}")
            return []
    
    def _process_docx(self, file_path):
        """Xử lý file DOCX"""
        try:
            doc = docx.Document(file_path)
            full_text = '\n'.join([para.text for para in doc.paragraphs])
            
            # Làm sạch văn bản
            full_text = self._clean_text(full_text)
            
            # Chia thành các chunks
            text_chunks = self._text_to_chunks(full_text)
            
            return [{'text': chunk, 'source': os.path.basename(file_path)} for chunk in text_chunks]
        except Exception as e:
            print(f"Lỗi khi xử lý DOCX {file_path}: {str(e)}")
            return []
    
    def _clean_text(self, text):
        """Làm sạch văn bản"""
        # Loại bỏ các ký tự điều khiển và khoảng trắng thừa
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\S\r\n]+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        return text.strip()
    
    def _text_to_chunks(self, text):
        """Chia văn bản thành các đoạn nhỏ với overlap"""
        # Tách thành các câu trước
        sentences = sent_tokenize(text)
        
        chunks = []
        current_chunk = []
        current_chunk_size = 0
        
        for sentence in sentences:
            sentence_size = len(sentence)
            
            # Nếu chunk hiện tại đạt giới hạn, lưu lại và bắt đầu chunk mới
            if current_chunk_size + sentence_size > self.chunk_size and current_chunk:
                chunks.append(' '.join(current_chunk))
                
                # Tạo overlap bằng cách giữ lại một số câu cuối
                overlap_size = 0
                overlap_sentences = []
                
                for i in range(len(current_chunk) - 1, -1, -1):
                    overlap_sentences.insert(0, current_chunk[i])
                    overlap_size += len(current_chunk[i])
                    if overlap_size >= self.chunk_overlap:
                        break
                
                current_chunk = overlap_sentences
                current_chunk_size = overlap_size
            
            current_chunk.append(sentence)
            current_chunk_size += sentence_size
        
        # Thêm chunk cuối cùng nếu còn
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks