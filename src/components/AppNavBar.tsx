import React from "react";
import { Button, Nav, Navbar } from "react-bootstrap";
import { Link } from "wouter";
import useAgentStore from "hooks/useAgentStore";
import { saveAs } from "file-saver";

export default function AppNavBar() {
  const { agentConfig, rawData, unloadAgent } = useAgentStore();

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {agentConfig && (
            <>
              <Link href="/intent-list">
                <Nav.Link>Rename Intents</Nav.Link>
              </Link>
              <Link href="/agent-map">
                <Nav.Link>Agent Map</Nav.Link>
              </Link>
            </>
          )}
          {!agentConfig && (
            <>
              <Link href="/import-agent">
                <Nav.Link>Import Agent</Nav.Link>
              </Link>
            </>
          )}
        </Nav>
        <Navbar.Text>
          Agent: {!agentConfig && <span>None</span>}
          {agentConfig && rawData !== null && (
            <span>
              <Button
                variant="link"
                onClick={() => {
                  saveAs(new Blob([rawData]), "agent.zip");
                }}
              >
                {agentConfig.displayName}
              </Button>
              <Button
                className="ml-2"
                variant="outline-dark"
                onClick={() => unloadAgent()}
              >
                Unload Agent
              </Button>
            </span>
          )}
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
}
