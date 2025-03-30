import os
import sys
import logging
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

def plot_decision_boundary(model_path, projection_csv, title="Decision Boundary", save_fig=False, fig_path="decision_boundary.png"):
    """
    Loads the trained SVC model and 2D projection data, then plots the decision boundary along with the data points
    """
    if not os.path.exists(model_path):
        logging.error(f"Model file not found at {model_path}")
        return
    if not os.path.exists(projection_csv):
        logging.error(f"Projection CSV not found at {projection_csv}")
        return

    svc = joblib.load(model_path)
    df_proj = pd.read_csv(projection_csv)
    X = df_proj[['dim1', 'dim2']].values
    labels = df_proj['pseudo_label'].values

    x_min, x_max = X[:, 0].min() - 0.1, X[:, 0].max() + 0.1
    y_min, y_max = X[:, 1].min() - 0.1, X[:, 1].max() + 0.1
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 200),
                         np.linspace(y_min, y_max, 200))
    grid_points = np.c_[xx.ravel(), yy.ravel()]
    Z = svc.predict(grid_points)
    Z = Z.reshape(xx.shape)

    plt.figure(figsize=(8, 6))
    plt.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.coolwarm)
    scatter = plt.scatter(X[:, 0], X[:, 1], c=labels, cmap=plt.cm.coolwarm, edgecolors='k', s=50)
    plt.xlabel("Dimension 1")
    plt.ylabel("Dimension 2")
    plt.title(f"Decision Boundary for: {title}")
    plt.colorbar(scatter, label="Cluster Label")
    
    if save_fig:
        plt.savefig(fig_path, dpi=300)
        logging.info(f"Saved decision boundary plot to {fig_path}")
    plt.show()

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python visualize_decision_boundary.py <model_path> <projection_csv> [title]")
        sys.exit(1)
    model_path = sys.argv[1]
    projection_csv = sys.argv[2]
    plot_title = sys.argv[3] if len(sys.argv) >= 4 else "Decision Boundary"
    plot_decision_boundary(model_path, projection_csv, title=plot_title)
