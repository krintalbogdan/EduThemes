import os
import sys
import logging
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import rbf_kernel
from scipy.sparse.csgraph import connected_components
from sklearn.decomposition import KernelPCA
from sklearn.svm import SVC
import joblib

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

def support_vector_clustering(X, gamma=0.5, similarity_threshold=0.8):
    """
    Compute the RBF kernel matrix, threshold it to form an adjacency matrix,
    and then extract connected components as the pseudo-labels
    """
    K = rbf_kernel(X, gamma=gamma)
    A = (K > similarity_threshold).astype(int)
    _, labels = connected_components(csgraph=A, directed=False, connection='weak')
    return labels

def generate_cluster_title(texts):
    """Generate a simple title from the most common word in the combined texts"""
    from collections import Counter
    words = []
    for t in texts:
        words.extend(t.split())
    if not words:
        return "No Title"
    most_common, _ = Counter(words).most_common(1)[0]
    return most_common.capitalize()

def train_svm_on_question(preprocessed_folder, input_file, question, svm_output_csv, model_output_path, projection_csv,
                          gamma_kernel=0.5, similarity_threshold=0.8, kpca_gamma=0.1):
    """
    Loads the preprocessed CSV for the given survey question, vectorizes the cleaned responses,
    clusters them using an RBF kernel approach to obtain pseudo‑labels, projects the high‑dimensional
    TF‑IDF features to 2D with Kernel PCA, trains an SVC classifier on the 2D data, saves the model,
    writes the 2D projection, and outputs a CSV of classification results
    """
    # safe_name = "".join([c if c.isalnum() else "_" for c in question])
    file_name = os.path.basename(input_file)
    file_path = os.path.join(preprocessed_folder, f"{file_name}_preprocessed.csv")
    if not os.path.exists(file_path):
        logging.error(f"Preprocessed file for question '{question}' not found at {file_path}")
        sys.exit(1)
        
    df_proc = pd.read_csv(file_path)
    texts = df_proc['cleaned'].tolist()
    if not texts:
        logging.error(f"No responses available for question: {question}")
        sys.exit(1)
    
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(texts)
    X_dense = X.toarray()
    
    # Create the pseudo-labels using the clustering approach
    pseudo_labels = support_vector_clustering(X_dense, gamma=gamma_kernel, similarity_threshold=similarity_threshold)
    df_proc['pseudo_label'] = pseudo_labels
    n_clusters = len(set(pseudo_labels))
    logging.info(f"Found {n_clusters} clusters (pseudo-labels) for the question.")
    
    # Project TF-IDF space into 2D with Kernel PCA
    kpca = KernelPCA(n_components=2, kernel='rbf', gamma=kpca_gamma)
    X_2d = kpca.fit_transform(X_dense)
    df_projection = pd.DataFrame(X_2d, columns=['dim1', 'dim2'])
    df_projection['pseudo_label'] = pseudo_labels
    df_projection.to_csv(projection_csv, index=False)
    logging.info(f"Saved 2D projection data to {projection_csv}")
    
    # Train an SVC classifier on the 2D data
    svc = SVC(kernel='rbf', gamma='scale', decision_function_shape='ovr')
    svc.fit(X_2d, pseudo_labels)
    joblib.dump(svc, model_output_path)
    logging.info(f"Saved trained SVC model to {model_output_path}")
    
    predictions = svc.predict(X_2d)
    df_proc['svm_label'] = predictions
    
    # Organize output for CSV classification (first row: question, second row: cluster titles, then responses)
    clusters = {}
    for cluster in sorted(set(predictions)):
        cluster_texts = df_proc[df_proc['svm_label'] == cluster]['original'].tolist()
        title = generate_cluster_title(" ".join(cluster_texts))
        clusters[cluster] = {'title': f"Class {cluster+1}: {title}", 'responses': cluster_texts}
    
    max_len = max(len(info['responses']) for info in clusters.values())
    data = {}
    for cluster, info in clusters.items():
        col = [info['title']] + info['responses'] + [''] * (max_len - len(info['responses']))
        data[f"Class {cluster+1}"] = col
    out_df = pd.DataFrame(data)
    question_row = {col: question for col in out_df.columns}
    out_df = pd.concat([pd.DataFrame([question_row]), out_df], ignore_index=True)
    out_df.to_csv(svm_output_csv, index=False)
    logging.info(f"Saved SVM classification output to {svm_output_csv}")

if __name__ == '__main__':
    if len(sys.argv) < 6:
        print("Usage: python svm_model_training.py <preprocessed_folder> <question> <svm_output_csv> <model_output_path> <projection_csv>")
        sys.exit(1)
    preprocessed_folder = sys.argv[1]
    question = sys.argv[2]
    svm_output_csv = sys.argv[3]
    model_output_path = sys.argv[4]
    projection_csv = sys.argv[5]
    train_svm_on_question(preprocessed_folder, None, question, svm_output_csv, model_output_path, projection_csv)
