import os
import json
import numpy as np
import faiss
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class VectorStore:
    """
    Lớp quản lý vector database sử dụng FAISS
    """
    
    def __init__(self, model_name: str = "paraphrase-multilingual-MiniLM-L12-v2", 
                 vector_dir: str = "data/vector_store"):
        """
        Khởi tạo Vector Store
        
        Args:
            model_name: Tên mô hình SentenceTransformer để tạo embeddings
            vector_dir: Thư mục lưu trữ vector database
        """
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.vector_dir = vector_dir
        
        # Tạo thư mục nếu chưa tồn tại
        if not os.path.exists(vector_dir):
            os.makedirs(vector_dir)
        
        # Khởi tạo FAISS index
        self.index = faiss.IndexFlatL2(self.dimension)
        
        # Lưu trữ nội dung và metadata của các chunk
        self.documents = []
        
        # Tải vector store nếu đã tồn tại
        self._load_vector_store()
    
    def _load_vector_store(self):
        """Tải vector store từ đĩa nếu đã tồn tại"""
        index_path = os.path.join(self.vector_dir, "index.faiss")
        docs_path = os.path.join(self.vector_dir, "documents.json")
        
        if os.path.exists(index_path) and os.path.exists(docs_path):
            # Tải FAISS index
            self.index = faiss.read_index(index_path)
            
            # Tải documents
            with open(docs_path, 'r', encoding='utf-8') as f:
                self.documents = json.load(f)
    
    def _save_vector_store(self):
        """Lưu vector store vào đĩa"""
        index_path = os.path.join(self.vector_dir, "index.faiss")
        docs_path = os.path.join(self.vector_dir, "documents.json")
        
        # Lưu FAISS index
        faiss.write_index(self.index, index_path)
        
        # Lưu documents
        with open(docs_path, 'w', encoding='utf-8') as f:
            json.dump(self.documents, f, ensure_ascii=False, indent=2)
    
    def add_documents(self, documents: List[Dict[str, Any]], source: Optional[str] = None):
        """
        Thêm documents vào vector store
        
        Args:
            documents: Danh sách các document (chunks) cần thêm vào
            source: Nguồn của tài liệu (tên file)
        """
        if not documents:
            return
        
        # Trích xuất nội dung văn bản từ documents
        texts = [doc['content'] for doc in documents]
        
        # Tạo embeddings
        embeddings = self.model.encode(texts)
        
        # Thêm vào FAISS index
        self.index.add(np.array(embeddings).astype('float32'))
        
        # Cập nhật source trong metadata nếu được cung cấp
        if source:
            for doc in documents:
                if 'metadata' in doc:
                    doc['metadata']['source'] = source
        
        # Thêm documents vào danh sách
        self.documents.extend(documents)
        
        # Lưu vector store
        self._save_vector_store()
    
    def similarity_search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Tìm kiếm các document tương tự với câu query
        
        Args:
            query: Câu truy vấn cần tìm kiếm
            k: Số lượng kết quả trả về
            
        Returns:
            Danh sách các document tương tự nhất
        """
        if not self.documents:
            return []
        
        # Giới hạn k không vượt quá số lượng document hiện có
        k = min(k, len(self.documents))
        
        # Tạo embedding cho query
        query_embedding = self.model.encode([query])[0].reshape(1, -1).astype('float32')
        
        # Tìm kiếm trong FAISS
        distances, indices = self.index.search(query_embedding, k)
        
        # Lấy các document tương ứng
        results = [self.documents[idx] for idx in indices[0]]
        
        return results
    
    def rerank_results(self, query: str, results: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Re-rank kết quả tìm kiếm để cải thiện độ chính xác
        
        Args:
            query: Câu truy vấn gốc
            results: Kết quả tìm kiếm ban đầu
            top_k: Số lượng kết quả trả về sau khi re-rank
            
        Returns:
            Danh sách các document sau khi re-rank
        """
        if not results:
            return []
        
        # Giới hạn top_k không vượt quá số lượng kết quả hiện có
        top_k = min(top_k, len(results))
        
        # Trích xuất nội dung văn bản từ kết quả
        texts = [result['content'] for result in results]
        
        # Tạo embeddings cho query và các văn bản
        query_embedding = self.model.encode([query])[0]
        text_embeddings = self.model.encode(texts)
        
        # Tính toán độ tương đồng cosine giữa query và các văn bản
        similarities = cosine_similarity([query_embedding], text_embeddings)[0]
        
        # Sắp xếp kết quả theo độ tương đồng giảm dần
        sorted_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Lấy các document được re-rank
        reranked_results = [results[idx] for idx in sorted_indices]
        
        return reranked_results