import AppNavBar from "components/AppNavBar";
import useAgentStore from "hooks/useAgentStore";
import AgentImportPage from "pages/AgentImportPage";
import AgentMapPage from "pages/AgentMapPage";
import IntentListPage from "pages/IntentListPage";
import React from "react";
import { Container } from "react-bootstrap";
import { Redirect, Route, Switch } from "wouter";

function App() {
  const state = useAgentStore();

  return (
    <>
      <AppNavBar />
      <Container fluid>
        {state.agentConfig && (
          <Switch>
            <Route path="/intent-list" component={IntentListPage} />
            <Route path="/agent-map" component={AgentMapPage} />
            <Route>
              <Redirect to="/intent-list" />
            </Route>
          </Switch>
        )}
        {!state.agentConfig && (
          <Switch>
            <Route path="/import-agent" component={AgentImportPage} />
            <Route>
              <Redirect to="/import-agent" />
            </Route>
          </Switch>
        )}
      </Container>
    </>
  );
}

export default App;
