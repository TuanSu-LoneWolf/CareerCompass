# Chatbot RAG Tư Vấn Hướng Nghiệp

Hệ thống chatbot sử dụng công nghệ RAG (Retrieval-Augmented Generation) để tư vấn hướng nghiệp dựa trên dữ liệu từ các nguồn tài liệu như PDF, sách, và bài báo nghiên cứu.

## Tính năng

- **Trích xuất thông tin từ tài liệu**: Hỗ trợ PDF, TXT, DOCX
- **Xử lý dữ liệu**: Làm sạch và chia nhỏ văn bản thành các đoạn (chunking)
- **Vector Database**: Lưu trữ dữ liệu đã vector hóa trong FAISS
- **RAG Pipeline**: Kết hợp tìm kiếm ngữ nghĩa và sinh văn bản với Gemini API
- **Giao diện thân thiện**: Web interface dễ sử dụng với Flask và HTML/CSS/JS

## Cài đặt

1. Clone repository:
   ```
   git clone https://github.com/yourusername/career-advisor-rag.git
   cd career-advisor-rag
   ```

2. Tạo môi trường ảo:
   ```
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. Cài đặt các thư viện:
   ```
   pip install -r requirements.txt
   ```

4. Thiết lập API key:
   ```
   export GEMINI_API_KEY="your_gemini_api_key"  # Linux/Mac
   set GEMINI_API_KEY="your_gemini_api_key"     # Windows
   ```

## Sử dụng

1. Chạy ứng dụng:
   ```
   python app.py
   ```

2. Mở trình duyệt và truy cập:
   ```
   http://localhost:5000
   ```

3. Tải lên tài liệu:
   - Chuyển qua tab "Tải tài liệu"
   - Chọn và tải lên các tài liệu PDF, TXT hoặc DOCX về hướng nghiệp
   - Đợi hệ thống xử lý tài liệu

4. Đặt câu hỏi:
   - Chuyển qua tab "Tư vấn"
   - Nhập câu hỏi liên quan đến hướng nghiệp
   - Nhận câu trả lời dựa trên thông tin trong tài liệu đã tải lên

## Cấu trúc dự án

```
career_advisor_rag/
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── templates/
│   └── index.html
├── data/
│   ├── raw/              # Chứa PDF, sách, bài báo nghiên cứu
│   ├── processed/        # Chứa dữ liệu sau khi xử lý
│   └── vector_store/     # Chứa FAISS index
├── app.py                # Flask backend
├── rag_engine.py         # Xử lý logic RAG
├── data_processor.py     # Xử lý PDF và chunking
├── requirements.txt
└── README.md
```

## Quy trình RAG

1. **Xử lý tài liệu**:
   - Trích xuất văn bản từ tài liệu
   - Làm sạch và chia thành các đoạn nhỏ

2. **Vector hóa**:
   - Chuyển các đoạn văn bản thành vector embedding
   - Lưu trữ vector và metadata trong FAISS

3. **Truy vấn**:
   - Chuyển câu hỏi thành vector
   - Tìm các đoạn văn bản có liên quan nhất
   - Sắp xếp lại kết quả (re-ranking)

4. **Sinh câu trả lời**:
   - Kết hợp câu hỏi và ngữ cảnh từ các đoạn văn bản
   - Sử dụng Gemini API để sinh câu trả lời chất lượng cao

## Yêu cầu hệ thống

- Python 3.8+
- API key cho Gemini AI

## Cải tiến trong tương lai

- Tích hợp thêm nhiều định dạng tài liệu
- Cải thiện thuật toán re-ranking
- Thêm chức năng phản hồi và cải thiện câu trả lời
- Hỗ trợ đa ngôn ngữ đầy đủ
- Triển khai giao diện người dùng di động

## Giấy phép

MIT License