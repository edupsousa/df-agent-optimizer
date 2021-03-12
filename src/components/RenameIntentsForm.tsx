import { IntentListItem } from "hooks/useAgentStore/types";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

const caseInsenstiveReplace = (
  value: string,
  needle: string,
  haystack: string
): string => {
  var esc = needle.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  var reg = new RegExp(esc, "ig");
  return value.replace(reg, haystack);
};

export type IntentFilterFn = (item: IntentListItem) => boolean;
export type IntentRenameFn = (oldName: string) => string;

type RenameIntentsFormProps = {
  disableRename: boolean;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFormChange: (
    filterFunction: IntentFilterFn,
    renameFunction: IntentRenameFn
  ) => void;
};

export default function RenameIntentsForm({
  handleSubmit,
  disableRename,
  onFormChange,
}: RenameIntentsFormProps) {
  const [useRegexp, setUseRegexp] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [filterString, setFilterString] = useState("");
  const [replacement, setReplacement] = useState("");
  const [filterRegexp, setFilterRegexp] = useState<RegExp | null>(null);

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

  useEffect(() => {
    const filterFunction = ({ intent: i }: IntentListItem): boolean => {
      return useRegexp && filterRegexp
        ? filterRegexp.test(i.name)
        : (caseInsensitive ? i.name.toLowerCase() : i.name).includes(
            caseInsensitive ? filterString.toLowerCase() : filterString
          );
    };
    const renameFunction = (name: string): string => {
      if (!useRegexp)
        return caseInsensitive
          ? caseInsenstiveReplace(name, filterString, replacement)
          : name.replaceAll(filterString, replacement);
      if (!filterRegexp) return name;
      return name.replace(filterRegexp, replacement);
    };
    onFormChange(filterFunction, renameFunction);
  }, [
    caseInsensitive,
    filterRegexp,
    filterString,
    onFormChange,
    replacement,
    useRegexp,
  ]);

  const renameDisabled = useMemo(
    () =>
      disableRename ||
      filterString.length === 0 ||
      replacement.length === 0 ||
      (useRegexp && !filterRegexp),
    [
      disableRename,
      filterRegexp,
      filterString.length,
      replacement.length,
      useRegexp,
    ]
  );

  return (
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
            disabled={renameDisabled}
            block
          >
            Rename Intents
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
