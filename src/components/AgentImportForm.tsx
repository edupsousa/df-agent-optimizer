import React, { useState } from "react";
import { Form, Col, Button } from "react-bootstrap";
import { useAgentFile } from "../hooks/useAgentFile";

export default function AgentImportForm() {
  const { loadAgentFile } = useAgentFile();
  const [zipFile, setZipFile] = useState<null | File>(null);
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (zipFile === null) return;
    await loadAgentFile(zipFile);
  };

  const handleAgentFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files && ev.target.files.length > 0)
      setZipFile(ev.target.files[0]);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h1>Import Agent</h1>
      <Form.Row>
        <Col>
          <Form.File
            id="zipFile"
            label={
              zipFile
                ? zipFile.name
                : "Select an exported DialogFlow Agent (.zip file)"
            }
            onChange={handleAgentFileChange}
            custom
          />
        </Col>
        <Col xs="auto">
          <Button variant="primary" type="submit" disabled={zipFile === null}>
            Import Agent
          </Button>
        </Col>
      </Form.Row>
    </Form>
  );
}
