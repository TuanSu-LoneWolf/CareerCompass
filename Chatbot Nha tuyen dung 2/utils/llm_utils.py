import os
import google.generativeai as genai
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

# Tải biến môi trường từ file .env ở thư mục cha
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))


# Lấy API key từ biến môi trường
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("Không tìm thấy GOOGLE_API_KEY trong biến môi trường hoặc file .env")

# Cấu hình API
genai.configure(api_key=api_key)

# Gọi ListModels để lấy danh sách mô hình có sẵn
models = list(genai.list_models())  # Chuyển generator thành list
print(models)


class GeminiHandler:
    """
    Lớp xử lý tương tác với Gemini API
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Khởi tạo GeminiHandler
        
        Args:
            api_key: Google AI API key, nếu không cung cấp sẽ lấy từ biến môi trường
        """
        if api_key is None:
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("API key không được cung cấp và không tìm thấy trong biến môi trường GOOGLE_API_KEY")
        
        genai.configure(api_key=api_key)
        
        # Lấy tên mô hình hợp lệ từ danh sách mô hình
        model_name = 'models/gemini-2.5-pro-exp-03-25'
        
        # Khởi tạo mô hình
        self.model = genai.GenerativeModel(model_name)
        
        self.chat_session = self.model.start_chat(
            history=[ 
                {
                    "role": "user",
                    "parts": ["Bạn là trợ lý tuyển dụng AI. Nhiệm vụ của bạn là trả lời các câu hỏi về tuyển dụng, đánh giá CV, quy trình phỏng vấn, và cung cấp thông tin liên quan đến nhân sự dựa trên tài liệu được cung cấp. Hãy trả lời một cách chuyên nghiệp và chính xác."]
                },
                {
                    "role": "model",
                    "parts": ["Tôi sẽ đóng vai trò là trợ lý tuyển dụng AI, hỗ trợ bạn với các câu hỏi về tuyển dụng, đánh giá CV, quy trình phỏng vấn, và thông tin nhân sự dựa trên tài liệu được cung cấp. Tôi sẽ cố gắng trả lời một cách chuyên nghiệp, chính xác và hữu ích. Bạn có thể hỏi tôi bất cứ điều gì liên quan đến công việc tuyển dụng!"]
                }
            ]
        )
    
    def generate_response(self, query: str, context: str) -> str:
        """
        Tạo câu trả lời dựa trên câu hỏi của người dùng và ngữ cảnh từ tài liệu
        
        Args:
            query: Câu hỏi của người dùng
            context: Ngữ cảnh từ các đoạn văn bản liên quan
            
        Returns:
            Câu trả lời được tạo bởi Gemini
        """
        try:
            prompt = f"""
            Dựa trên ngữ cảnh sau đây, hãy trả lời câu hỏi của người dùng một cách chính xác và đầy đủ.
            Nếu câu trả lời không có trong ngữ cảnh, hãy trả lời là "Tôi không tìm thấy thông tin về vấn đề này trong tài liệu hiện có."
            
            Ngữ cảnh:
            {context}
            
            Câu hỏi: {query}
            
            Câu trả lời:
            """
            response = self.chat_session.send_message(prompt)
            return response.text
        except Exception as e:
            return f"Có lỗi xảy ra khi tạo câu trả lời: {str(e)}"


# Kiểm tra mô hình và khởi tạo lớp GeminiHandler
if __name__ == "__main__":
    handler = GeminiHandler()
    response = handler.generate_response("Quy trình phỏng vấn như thế nào?", "Mô tả chi tiết quy trình phỏng vấn tuyển dụng tại công ty ABC.")
    print(response)
