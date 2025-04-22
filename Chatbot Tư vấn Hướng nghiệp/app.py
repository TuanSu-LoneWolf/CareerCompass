from flask import Flask, render_template, request, jsonify
import os
from rag_engine import RAGEngine

app = Flask(__name__)

# Khởi tạo RAG Engine
rag_engine = RAGEngine(
    vector_store_path="data/vector_store/faiss_index",
    gemini_api_key=os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Lưu file
        filepath = os.path.join('data/raw', file.filename)
        file.save(filepath)
        
        # Xử lý tài liệu
        try:
            rag_engine.process_document(filepath)
            return jsonify({'success': f'File {file.filename} uploaded and processed successfully'}), 200
        except Exception as e:
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'txt', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question', '')
    
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    
    try:
        response = rag_engine.answer_question(question)
        return jsonify({
            'answer': response['answer'],
            'sources': response['sources'],
            'context_used': response['context_used']
        }), 200
    except Exception as e:
        return jsonify({'error': f'Error generating answer: {str(e)}'}), 500

if __name__ == '__main__':
    # Tạo thư mục cần thiết nếu chưa tồn tại
    os.makedirs('data/raw', exist_ok=True)
    os.makedirs('data/processed', exist_ok=True)
    os.makedirs('data/vector_store', exist_ok=True)
    
    app.run(debug=True)