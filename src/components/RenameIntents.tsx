import useAgentStore, { Intent } from "hooks/useAgentStore";
import React, { useEffect, useMemo, useState } from "react";
import { Col, Form, ListGroup, Row } from "react-bootstrap";

export default function RenameIntents() {
  const [useRegexp, setUseRegexp] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [filterString, setFilterString] = useState("");
  const [replacement, setReplacement] = useState("");
  const [filterRegexp, setFilterRegexp] = useState<RegExp | null>(null);
  const { intentList } = useAgentStore();
  const intents = useMemo(
    () =>
      intentList === null
        ? []
        : intentList
            .slice()
            .filter((i) =>
              useRegexp && filterRegexp
                ? filterRegexp.test(i.name)
                : (caseInsensitive ? i.name.toLowerCase() : i.name).includes(
                    caseInsensitive ? filterString.toLowerCase() : filterString
                  )
            )
            .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)),
    [intentList, filterRegexp, useRegexp, filterString, caseInsensitive]
  );

  useEffect(() => {
    if (!useRegexp) return;
    try {
      const regExp = new RegExp(
        filterString,
        caseInsensitive ? "i" : undefined
      );
      setFilterRegexp(regExp);
    } catch (e) {
      setFilterRegexp(null);
    }
  }, [filterString, caseInsensitive, useRegexp]);

  const getReplacement = (name: string): string => {
    if (!useRegexp)
      return caseInsensitive
        ? caseInsenstiveReplace(name, filterString, replacement)
        : name.replaceAll(filterString, replacement);
    if (!filterRegexp) return name;
    return name.replace(filterRegexp, replacement);
  };

  const caseInsenstiveReplace = (
    value: string,
    needle: string,
    haystack: string
  ): string => {
    var esc = needle.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    var reg = new RegExp(esc, "ig");
    return value.replace(reg, haystack);
  };

  const renderIntent = (i: Intent) => {
    return (
      <ListGroup.Item key={i.id}>
        <Row>
          <Col>{i.name}</Col>
          <Col xs="auto">{"->"}</Col>
          <Col className="text-right">{getReplacement(i.name)}</Col>
        </Row>
      </ListGroup.Item>
    );
  };

  return (
    <div>
      <h1>Rename Intents</h1>
      <Form>
        <Form.Group as={Row} controlId="filter">
          <Form.Label column sm={2}>
            Find:
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              value={filterString}
              onChange={(ev) => setFilterString(ev.target.value)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="replacement">
          <Form.Label column sm={2}>
            Replace:
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              value={replacement}
              onChange={(ev) => setReplacement(ev.target.value)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="caseInsensitive">
          <Col sm={{ span: 10, offset: 2 }}>
            <Form.Check
              label="Case Insensitive"
              checked={caseInsensitive}
              onChange={(ev) => setCaseInsensitive(ev.target.checked)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="isRegexp">
          <Col sm={{ span: 10, offset: 2 }}>
            <Form.Check
              label="Regular Expression"
              checked={useRegexp}
              onChange={(ev) => setUseRegexp(ev.target.checked)}
            />
          </Col>
        </Form.Group>
      </Form>
      Matched {intents.length} intents.
      <ListGroup>{intents && intents.map(renderIntent)}</ListGroup>
    </div>
  );
}
