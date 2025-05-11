import os
import json
from typing import List, Dict, Any

def load_career_data(file_path: str) -> List[Dict[str, Any]]:
    """Load career data from a JSON file."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return data

def list_all_careers(data: List[Dict[str, Any]]) -> List[str]:
    """Get list of all careers from the data."""
    return [career['name'] for career in data if 'name' in career]

def get_questions_by_career(data: List[Dict[str, Any]], career_name: str) -> List[str]:
    """Get list of questions based on career name."""
    for career in data:
        if career.get('name', '').lower() == career_name.lower():
            return career.get('criteria', [{}])[0].get('questions', [])
    return []

import os
import json

def load_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # Trở về thư mục gốc project
    data_file = os.path.join(base_dir, 'data', 'processed', 'data.json')

    with open(data_file, 'r', encoding='utf-8') as f:
        career_data = json.load(f)
    
    return career_data


# Global data
career_data = load_data()