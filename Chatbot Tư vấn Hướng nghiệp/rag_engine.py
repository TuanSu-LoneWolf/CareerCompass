import os
import faiss
import numpy as np
import pickle
import google.generativeai as genai
from data_processor import DataProcessor
from sentence_transformers import SentenceTransformer

class RAGEngine:
    def __init__(self, vector_store_path, gemini_api_key):
         # Khởi tạo model chuyển văn bản thành vector
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.vector_dimension = self.embedding_model.get_sentence_embedding_dimension()
        
        # Khởi tạo Gemini API
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel('gemini-1.0-pro')
        
        # Khởi tạo DataProcessor để xử lý dữ liệu
        self.data_processor = DataProcessor()
        
        # Vector store path
        self.vector_store_path = vector_store_path
        self.index_path = f"{vector_store_path}.index"
        self.metadata_path = f"{vector_store_path}.pkl"
        
        # Tạo hoặc load vector store
        self._init_vector_store()
    
    def _init_vector_store(self):
        """Khởi tạo hoặc tải vector store FAISS"""
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            # Load index và metadata đã tồn tại
            self.index = faiss.read_index(self.index_path)
            with open(self.metadata_path, 'rb') as f:
                self.chunks_metadata = pickle.load(f)
        else:
            # Tạo index mới
            self.index = faiss.IndexFlatL2(self.vector_dimension)
            self.chunks_metadata = []  # Lưu metadata của từng chunk
            
            # Lưu index và metadata trống
            os.makedirs(os.path.dirname(self.vector_store_path), exist_ok=True)
            faiss.write_index(self.index, self.index_path)
            with open(self.metadata_path, 'wb') as f:
                pickle.dump(self.chunks_metadata, f)
    
    def process_document(self, file_path):
        """Xử lý tài liệu mới và thêm vào vector store"""
        # Đọc và chia nhỏ tài liệu
        chunks = self.data_processor.process_file(file_path)
        
        if not chunks:
            raise ValueError(f"Không thể xử lý file {file_path}")
        
        # Tạo embedding cho từng chunk
        for chunk in chunks:
            # Chuyển đổi thành vector embedding
            embedding = self.embedding_model.encode([chunk['text']])[0]
            
            # Thêm vào FAISS index
            self.index.add(np.array([embedding], dtype=np.float32))
            
            # Lưu metadata
            self.chunks_metadata.append({
                'text': chunk['text'],
                'source': chunk['source'],
                'page': chunk.get('page', None)
            })
        
        # Lưu index và metadata đã cập nhật
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(self.chunks_metadata, f)
    
    def answer_question(self, question, top_k=5):
        """Sử dụng RAG để trả lời câu hỏi"""
        # Chuyển câu hỏi thành vector
        question_embedding = self.embedding_model.encode([question])[0]
        
        # Tìm kiếm các đoạn văn bản liên quan
        D, I = self.index.search(np.array([question_embedding], dtype=np.float32), top_k)
        
        # Nếu không tìm thấy kết quả nào
        if len(I[0]) == 0 or self.index.ntotal == 0:
            return {
                "answer": "Tôi không có đủ thông tin để trả lời câu hỏi này. Vui lòng thêm tài liệu liên quan.",
                "sources": [],
                "context_used": []
            }
        
        # Lấy các đoạn văn bản tương ứng
        retrieved_chunks = [self.chunks_metadata[idx] for idx in I[0] if idx < len(self.chunks_metadata)]
        
        # Re-ranking (đơn giản hóa bằng cách sắp xếp lại theo khoảng cách)
        chunk_scores = [(chunk, dist) for chunk, dist in zip(retrieved_chunks, D[0])]
        chunk_scores.sort(key=lambda x: x[1])  # Sắp xếp theo khoảng cách tăng dần
        
        # Chuẩn bị context để gửi đến Gemini
        context_text = "\n\n".join([f"Đoạn {i+1}:\n{chunk['text']}" for i, (chunk, _) in enumerate(chunk_scores)])
        
        # Chuẩn bị prompt
        prompt = f"""
Bạn là một trợ lý tuyển dụng AI chuyên nghiệp. Nhiệm vụ của bạn là cung cấp các tư vấn về nghề nghiệp, giúp người dùng hiểu rõ hơn về các cơ hội nghề nghiệp, yêu cầu công việc và chiến lược phát triển nghề nghiệp dựa trên thông tin mà bạn truy xuất được.

Yêu cầu:
    - Dựa trên thông tin tham khảo dưới đây, hãy trả lời câu hỏi của người dùng một cách chi tiết và hữu ích về nghề nghiệp.
    - Cung cấp các lời khuyên về việc phát triển nghề nghiệp, kỹ năng cần có, và cách tiếp cận các cơ hội công việc.
    - Trả lời các câu hỏi liên quan đến yêu cầu ngành nghề, kỹ năng cần có, thách thức trong nghề nghiệp, và các chiến lược nghề nghiệp.
    - Nếu không đủ thông tin để trả lời, hãy đề xuất các hướng nghiên cứu thêm hoặc tìm hiểu sâu hơn về ngành nghề đó.

Thông tin tham khảo:
{context_text}

Câu hỏi: {question}

Phong cách phản hồi:
- Giữ thái độ chuyên nghiệp, thân thiện và khích lệ.
- Đưa ra các lời khuyên thực tế dựa trên kiến thức chuyên môn và thông tin sẵn có.
- Tập trung vào các câu hỏi nghề nghiệp và chiến lược phát triển nghề nghiệp của người dùng.
"""


        # Gửi đến Gemini để tạo câu trả lời
        gemini_response = self.gemini_model.generate_content(prompt)
        answer = gemini_response.text
        
        # Trả về kết quả
        return {
            "answer": answer,
            "sources": [{"source": chunk["source"], "page": chunk.get("page")} for chunk, _ in chunk_scores],
            "context_used": [chunk["text"] for chunk, _ in chunk_scores]
        }