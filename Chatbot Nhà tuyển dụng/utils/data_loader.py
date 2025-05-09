import os
import json
from typing import List, Dict, Any

def load_career_data(file_path: str) -> List[Dict[str, Any]]:
    """
    Load dữ liệu nghề nghiệp từ file JSON.

    Args:
        file_path: Đường dẫn tới file JSON.

    Returns:
        List các bản ghi dữ liệu nghề nghiệp.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Không tìm thấy file: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return data

def list_all_careers(data: List[Dict[str, Any]]) -> List[str]:
    """
    Lấy danh sách tất cả các nghề nghiệp từ dữ liệu.

    Args:
        data: Dữ liệu nghề nghiệp.

    Returns:
        List tên nghề nghiệp.
    """
    return [career['name'] for career in data if 'name' in career]


def get_questions_by_career(data: List[Dict[str, Any]], career_name: str) -> List[str]:
    """
    Lấy danh sách câu hỏi theo tên nghề nghiệp.

    Args:
        data: Dữ liệu nghề nghiệp.
        career_name: Tên nghề nghiệp cần lấy câu hỏi.

    Returns:
        List câu hỏi.
    """
    for career in data:
        if career.get('name', '').lower() == career_name.lower():  # Chỉnh lại 'career' thành 'name'
            return career.get('criteria', [{}])[0].get('questions', [])  # Lấy câu hỏi từ tiêu chí đầu tiên
    return []
