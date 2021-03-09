import React, { useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import useAgentStore from "../hooks/useAgentStore";

export default function RenameIntents() {
  const [filterString, setFilterString] = useState("");
  const [filterRegexp, setFilterRegexp] = useState<RegExp | null>(null);
  const { intentList } = useAgentStore();
  const intents = useMemo(
    () =>
      intentList === null
        ? []
        : intentList
            .slice()
            .filter((i) => (filterRegexp ? filterRegexp.test(i.name) : true))
            .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)),
    [intentList, filterRegexp]
  );

  const handleFilterChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = ev.target.value;
    setFilterString(newValue);
    try {
      const regExp = new RegExp(newValue, "i");
      setFilterRegexp(regExp);
    } catch (e) {
      setFilterRegexp(null);
    }
  };

  return (
    <div>
      <h1>Rename Intents</h1>
      <Form>
        <Form.Control
          type="text"
          value={filterString}
          onChange={handleFilterChange}
        />
      </Form>
      <ul>
        {intents && intents.map((i) => <li key={i.id}>{i.name}</li>)}
        {!intents && <li>No intents to show</li>}
      </ul>
    </div>
  );
}
