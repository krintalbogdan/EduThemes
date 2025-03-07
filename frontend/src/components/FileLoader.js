import React, {useState} from "react";
import './FileLoader.css';


const FileLoader = () => {
  const [file, setFile] = useState(null);
  const [fileText, setFileText] = useState("Choose File");

  const fileChange = (e) => {
    if(e.target.files) {
      setFile(e.target.files[0]);
      setFileText("File name: " + e.target.files[0].name);
    }

  };

  const uploadFile = () => {
    //TBD
  }

  return (
    <>
      <div className="inputGroup">
        <input id="file" type="file" onChange={fileChange} style={{ display: 'none' }}  />
        <label for="file" class="uploadFile">{fileText}</label>
        
      </div>


      <div className="uploadButton">
        {file && (
            <button onClick={uploadFile} className="fileSubmit">Upload</button>
          )}
      </div>

    </>
  )
};

export default FileLoader;
