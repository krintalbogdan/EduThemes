# EduThemes

### Large-scale qualitative analysis of student responses presents significant challenges for instructors due to the time-intensive nature of thematic coding, though it offers great opportunity for feedback. While recent advances in Large Language Models (LLMs) show promise for supporting this process, their reliability and comparative advantage over traditional machine learning approaches remain unclear. This study evaluates five traditional machine learning methods - combining text representation techniques (TF-IDF, SentenceTransformers, Doc2Vec) with classification and clustering algorithms (SVM, Random Forest, DBSCAN) - against two state-of-the-art LLMs (GPT-4 and Claude-3) for supporting thematic analysis of student responses. We develop and test a custom interface that allows instructors to receive and evaluate coding suggestions from these different computational approaches while maintaining control over the analysis process. Using a dataset of 600 student responses, with 100 manually coded responses as ground truth, we will compare these methods on multiple dimensions including classification performance (precision, recall, F1-score), agreement with human coders (Cohen's Kappa), processing time and resource usage, and interface usability through user testing. This will contribute to an understanding of how computational methods can effectively support qualitative research while maintaining methodological rigor. The developed interface and study findings will be the main deliverables of this senior project.

## How To Run Locally
1. Starting in the `EduThemes` directory, run `cd frontend`
2. Run `npm install`
3. Run `npm start`
4. Run `cd ../backend`
5. Run `python -m venv venv`
6. Run `source venv/bin/activate` on Mac/Linux or `venv\Scripts\activate.bat` on Windows
7. **Verify that you see `(venv)` at the beginning of your command prompt before doing any work**
8. Run `pip install -r requirements.txt`
9. Run `flask run --port 1500`

### Notes:
1. When adding new dependencies, run `pip freeze > requirements.txt`
2. **Do not commit the `venv/` directory to the repository**
3. **Always make sure you activate the virtual environment before working to avoid any issues**
4. You can run `deactivate` to leave the virtual environment
