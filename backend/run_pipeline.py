import os
import sys
import logging
import pandas as pd

from src.preprocessing.data_preprocessing import preprocess_file
from src.models.svm.svm_model_training import train_svm_on_question
from src.visualization.visualize_decision_boundary import plot_decision_boundary

def main(input_file, svm_output_csv, model_output_path, projection_csv, selected_question=None):
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')
    
    # STEP 1: Preprocessing
    if not os.path.exists(input_file):
        logging.error("The specified raw dataset file does not exist.")
        raise FileNotFoundError(f"File not found: {input_file}")
    
    preprocessed_folder = os.path.join(".", "uploads", "processed")
    logging.info("Running data preprocessing...")
    preprocess_file(input_file, preprocessed_folder)
    
    # STEP 2: Select a Survey Question and Train SVM
    # Read raw dataset to list survey questions (assumes headers are the questions)
    ext = os.path.splitext(input_file)[1].lower()
    if ext == '.csv':
        df = pd.read_csv(input_file)
    elif ext in ['.xlsx', '.xls']:
        df = pd.read_excel(input_file)
    else:
        logging.error("Unsupported file format.")
        raise ValueError("Unsupported file format. Please use CSV or XLSX.")
        
    questions = list(df.columns)
    print("\nDetected the following survey questions:")
    for idx, question in enumerate(questions, start=1):
        print(f"{idx}. {question}")
    
    selection = 1 # for MVP, only allowing one question per sheet
    q_index = int(selection) - 1
    if q_index < 0 or q_index >= len(questions):
        logging.error("Invalid selection.")
        raise ValueError("Invalid selection. Please select a valid question number.")
    selected_question = questions[q_index]
    logging.info(f"Selected question: {selected_question}")
    
    logging.info("Training SVM classifier on the selected question...")
    train_svm_on_question(preprocessed_folder, input_file, selected_question, svm_output_csv, model_output_path, projection_csv)
    
    # # STEP 3: Visualize Decision Boundary
    logging.info("Visualizing decision boundary...")
    plot_decision_boundary(model_output_path, projection_csv, title=selected_question)
    
    logging.info("Pipeline complete.")

if __name__ == '__main__':
    main()
