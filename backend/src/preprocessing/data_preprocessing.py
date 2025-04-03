import pandas as pd
import os
import sys
import logging
import nltk
import string
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Ensure required NLTK data is available
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('punkt_tab')

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

def clean_text(text):
    """Clean text by lowercasing, removing punctuation, tokenizing, and lemmatizing."""
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = word_tokenize(text)
    lemmatizer = WordNetLemmatizer()
    lemmas = [lemmatizer.lemmatize(token) for token in tokens]
    return ' '.join(lemmas)

def preprocess_file(file_path, output_path):
    # Read input file (CSV or XLSX)
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.csv':
        df = pd.read_csv(file_path)
    elif ext in ['.xlsx', '.xls']:
        df = pd.read_excel(file_path)
    else:
        logging.error("Unsupported file format. Please use CSV or XLSX.")
        sys.exit(1)
    
    logging.info(f"Loaded file {file_path} with shape {df.shape}")
    
    # Process each survey question column: drop missing/blank responses and clean text
    preprocessed = {}
    for col in df.columns:
        question = str(col).strip()
        responses = df[col].dropna().astype(str).tolist()
        responses = [r for r in responses if r.strip() != ""]
        cleaned_responses = [clean_text(r) for r in responses]
        preprocessed[question] = pd.DataFrame({
            'original': responses,
            'cleaned': cleaned_responses
        })
        logging.info(f"Processed question: '{question}' with {len(responses)} responses.")
    
    # Save each question’s preprocessed data as a separate CSV file
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    for question, df_proc in preprocessed.items():
        file_name = os.path.splitext(os.path.basename(file_path))[0]
        out_file = os.path.join(output_path, f"{file_name}_preprocessed.csv")
        df_proc.to_csv(out_file, index=False)
        logging.info(f"Saved preprocessed data for '{question}' to {out_file}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python data_preprocessing.py <input_file> <output_folder>")
        sys.exit(1)
    input_file = sys.argv[1]
    output_folder = sys.argv[2]
    preprocess_file(input_file, output_folder)
