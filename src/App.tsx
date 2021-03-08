import React from "react";
import { Container } from "react-bootstrap";
import { Redirect, Route, Switch } from "wouter";
import AgentImportForm from "./components/AgentImportForm";
import AppNavBar from "./components/AppNavBar";
import IntentList from "./components/IntentList";
import { useAgentFile } from "./hooks/useAgentFile";

function App() {
  const { isAgentFileLoaded } = useAgentFile();

  return (
    <>
      <AppNavBar />
      <Container>
        {isAgentFileLoaded() && (
          <Switch>
            <Route path="/intents" component={IntentList} />
            <Route>
              <Redirect to="/intents" />
            </Route>
          </Switch>
        )}
        {!isAgentFileLoaded() && (
          <Switch>
            <Route path="/import" component={AgentImportForm} />
            <Route>
              <Redirect to="/import" />
            </Route>
          </Switch>
        )}
      </Container>
    </>
  );
}

export default App;
