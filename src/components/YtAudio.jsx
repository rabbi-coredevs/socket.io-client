import  { useState, useEffect } from "react";
import axios from "axios";
import openSocket from "socket.io-client";
import "./App.css";
import {
  Container,
  Row,
  Button,
  Input,
  Form,
  Col,
  Progress,
  Jumbotron,
} from "reactstrap";

const URL = "/";
const socket = openSocket(URL);

const YtAudio = () => {
  const [urlText, setUrlText] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [dataToBeDownloaded, setDataToBeDownloaded] = useState(0);
  const [dataDownloaded, setDataDownloaded] = useState(0);
  const [blobData, setBlobData] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [videoUploader, setVideoUploader] = useState("");

  useEffect(() => {
    socket.on("progressEventSocket", (data) => {
      setPercentage(data[0]);
    });

    socket.on("downloadCompletedServer", (data) => {
      setDataToBeDownloaded(data[0]);
    });

    socket.on("videoDetails", (data) => {
      setVideoName(data[0]);
      setVideoUploader(data[1]);
    });

    return () => {
      socket.off("progressEventSocket");
      socket.off("downloadCompletedServer");
      socket.off("videoDetails");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        URL,
        { url: urlText },
        {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            setDataDownloaded(progressEvent.loaded);
          },
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setBlobData(url);
      });
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <Input
              required
              type="text"
              placeholder="URL"
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
            ></Input>
          </Col>
        </Row>
        <Row style={{ textAlign: "center", marginTop: "10px" }}>
          <Col>
            <Button type="submit" color="primary" size="lg">
              Start Process
            </Button>
          </Col>
        </Row>
      </Form>

      {videoName && (
        <Row>
          <Col>
            <Jumbotron style={{ marginTop: "10px" }}>
              <h1>Title: {videoName}</h1>
              <p>Uploaded By: {videoUploader}</p>
            </Jumbotron>
          </Col>
        </Row>
      )}

      <Row className="progressBarRow">
        <Col xs="12">
          <Progress animated={percentage !== 100} value={percentage}>
            Warming up the router
          </Progress>
        </Col>
      </Row>

      <Row className="progressBarRow">
        <Col xs="12">
          <Progress
            animated={(dataDownloaded * 100) / dataToBeDownloaded !== 100}
            color="success"
            value={
              dataToBeDownloaded > 0
                ? (dataDownloaded * 100) / dataToBeDownloaded
                : 0
            }
          >
            Download Done
          </Progress>
        </Col>
      </Row>

      {blobData && (
        <Row className="downloadButton">
          <Col>
            <div>
              <p>Congratulations! Youve hacked into the Pentagon</p>
              <a href={blobData} download={`${videoName}.mp3`}>
                <Button color="danger" size="lg">
                  Download
                </Button>
              </a>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default YtAudio;
