import { useState } from "react";
import API from "../services/api";

function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {

        if (!file) {
            setMessage("Please select a PDF file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {

            setLoading(true);
            setMessage("");

            const response = await API.post(
                "/resume/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setMessage(response.data.message);

        } catch (error) {

            setMessage("Upload failed");

        } finally {

            setLoading(false);

        }
    };

    return (
        <div>

            <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
            />

            <button onClick={handleUpload}>
                {loading ? "Uploading..." : "Upload Resume"}
            </button>

            <p>{message}</p>

        </div>
    );
}

export default ResumeUpload;