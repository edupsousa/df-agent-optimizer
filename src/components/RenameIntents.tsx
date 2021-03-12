import useAgentStore, { IntentToRename } from "hooks/useAgentStore";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, ListGroup, Row } from "react-bootstrap";

const caseInsenstiveReplace = (
  value: string,
  needle: string,
  haystack: string
): string => {
  var esc = needle.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  var reg = new RegExp(esc, "ig");
  return value.replace(reg, haystack);
};

const getReplacement = (
  name: string,
  {
    useRegexp,
    caseInsensitive,
    filterString,
    replacement,
    filterRegexp,
  }: {
    useRegexp: boolean;
    caseInsensitive: boolean;
    filterString: string;
    replacement: string;
    filterRegexp: RegExp | null;
  }
): string => {
  if (!useRegexp)
    return caseInsensitive
      ? caseInsenstiveReplace(name, filterString, replacement)
      : name.replaceAll(filterString, replacement);
  if (!filterRegexp) return name;
  return name.replace(filterRegexp, replacement);
};

export default function RenameIntents() {
  const [useRegexp, setUseRegexp] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [filterString, setFilterString] = useState("");
  const [replacement, setReplacement] = useState("");
  const [filterRegexp, setFilterRegexp] = useState<RegExp | null>(null);
  const { intentList, renameIntents } = useAgentStore();
  const intents: IntentToRename[] = useMemo(
    () =>
      intentList === null
        ? []
        : intentList
            .slice()
            .filter(({ intent: i }) =>
              useRegexp && filterRegexp
                ? filterRegexp.test(i.name)
                : (caseInsensitive ? i.name.toLowerCase() : i.name).includes(
                    caseInsensitive ? filterString.toLowerCase() : filterString
                  )
            )
            .sort(({ intent: a }, { intent: b }) =>
              a.name > b.name ? 1 : a.name < b.name ? -1 : 0
            )
            .map((item) => ({
              ...item,
              newName: getReplacement(item.intent.name, {
                useRegexp,
                caseInsensitive,
                filterString,
                replacement,
                filterRegexp,
              }),
            })),
    [
      intentList,
      useRegexp,
      filterRegexp,
      caseInsensitive,
      filterString,
      replacement,
    ]
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

  const disableRename = useMemo(
    () =>
      intents.length === 0 ||
      filterString.length === 0 ||
      replacement.length === 0 ||
      (useRegexp && !filterRegexp),
    [intents, filterString, replacement, useRegexp, filterRegexp]
  );

  const renderIntent = ({ intent: i, newName }: IntentToRename) => {
    return (
      <ListGroup.Item key={i.id}>
        <Row>
          <Col>{i.name}</Col>
          <Col xs="auto">{"->"}</Col>
          <Col className="text-right">{newName}</Col>
        </Row>
      </ListGroup.Item>
    );
  };

  const handleSubmit = async (
    ev: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    ev.preventDefault();
    ev.stopPropagation();
    if (disableRename) return;

    console.log(`Will rename ${intents.length} intents.`);
    //TODO: Check for name collisions
    await renameIntents(intents);
  };

  return (
    <div>
      <h1>Rename Intents</h1>
      <Form onSubmit={handleSubmit}>
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
        <Row>
          <Col sm={{ span: 7, offset: 2 }}>
            <Form.Group as={Row} controlId="caseInsensitive">
              <Col>
                <Form.Check
                  label="Case Insensitive"
                  checked={caseInsensitive}
                  onChange={(ev) => setCaseInsensitive(ev.target.checked)}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="isRegexp">
              <Col>
                <Form.Check
                  label="Regular Expression"
                  checked={useRegexp}
                  onChange={(ev) => setUseRegexp(ev.target.checked)}
                />
              </Col>
            </Form.Group>
          </Col>
          <Col className="d-flex justify-content-center align-items-center">
            <Button
              variant="primary"
              type="submit"
              disabled={disableRename}
              block
            >
              Rename Intents
            </Button>
          </Col>
        </Row>
      </Form>
      Matched {intents.length} intents.
      <ListGroup>{intents && intents.map(renderIntent)}</ListGroup>
    </div>
  );
}
