import os
from flask import Flask, request, jsonify, render_template
from utils.document_processor import DocumentProcessor
from utils.vector_store import VectorStore
from utils.llm_utils import GeminiHandler
import json

app = Flask(__name__)

# Khởi tạo các thành phần
document_processor = DocumentProcessor()
vector_store = VectorStore()
llm_handler = GeminiHandler()

# Đường dẫn đến thư mục lưu trữ dữ liệu
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
RAW_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
VECTOR_STORE_DIR = os.path.join(DATA_DIR, 'vector_store')
processed_file = os.path.join(os.getcwd(), 'data', 'processed', 'data.json')

def load_data():
    processed_file_path = os.path.join(PROCESSED_DIR, 'data.json')
    if os.path.exists(processed_file_path):
        with open(processed_file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


# Tạo thư mục nếu chưa tồn tại
for dir_path in [DATA_DIR, RAW_DIR, PROCESSED_DIR, VECTOR_STORE_DIR]:
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        

@app.route('/')
def index():
    """Hiển thị trang chủ chatbot"""
    return render_template('infoPage.html')

@app.route('/api/upload', methods=['POST'])
def upload_document():
    """API upload tài liệu"""
    if 'file' not in request.files:
        return jsonify({'error': 'Không có file nào được gửi lên'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Không có file nào được chọn'}), 400
    
    file_path = os.path.join(RAW_DIR, file.filename)
    file.save(file_path)
    
    try:
        # Xử lý tài liệu
        chunks = document_processor.process_document(file_path)
        
        # Lưu chunks để tham chiếu sau này
        processed_file_path = os.path.join(PROCESSED_DIR, f"{os.path.splitext(file.filename)[0]}_chunks.json")
        with open(processed_file_path, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
        
        # Chuyển chunks thành vector và lưu vào FAISS
        vector_store.add_documents(chunks, file.filename)
        
        return jsonify({
            'success': True,
            'message': f'Tài liệu {file.filename} đã được xử lý và lưu trữ thành công',
            'chunks_count': len(chunks)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """API xử lý câu hỏi của người dùng"""
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'Cần cung cấp tin nhắn'}), 400
    
    user_query = data['message']
    
    try:
        # Tìm kiếm các đoạn văn bản liên quan
        relevant_chunks = vector_store.similarity_search(user_query)
        
        # Re-rank kết quả nếu cần
        reranked_chunks = vector_store.rerank_results(user_query, relevant_chunks)
        
        # Tạo ngữ cảnh từ các đoạn văn bản đã được re-rank
        context = "\n\n".join([chunk['content'] for chunk in reranked_chunks])
        
        # Gửi ngữ cảnh và câu hỏi đến Gemini để tạo câu trả lời
        response = llm_handler.generate_response(user_query, context)
        
        return jsonify({
            'answer': response,
            'sources': [{'title': chunk.get('metadata', {}).get('source', 'Unknown'), 
                          'content': chunk['content'][:150] + '...'} 
                        for chunk in reranked_chunks]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """API lấy danh sách tài liệu đã upload"""
    try:
        documents = []
        for filename in os.listdir(RAW_DIR):
            if os.path.isfile(os.path.join(RAW_DIR, filename)):
                documents.append({
                    'name': filename,
                    'date_added': os.path.getmtime(os.path.join(RAW_DIR, filename))
                })
        
        return jsonify({'documents': sorted(documents, key=lambda x: x['date_added'], reverse=True)})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/data/processed/data.json', methods=['GET'])
def get_processed_documents():
    """API lấy nội dung của file data.json trong processed"""
    try:
        processed_file = os.path.join(PROCESSED_DIR, 'data.json')
         # Log thêm để kiểm tra
        print(f"File data.json found at: {processed_file}")
        
        if not os.path.exists(processed_file):
            return jsonify({'error': 'Không tìm thấy file data.json'}), 404
        
        with open(processed_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return jsonify({'data': data})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)