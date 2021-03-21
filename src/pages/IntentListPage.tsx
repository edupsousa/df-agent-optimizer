import RenameIntentsForm, {
  IntentFilterFn,
  IntentRenameFn,
} from "components/RenameIntentsForm";
import RenameIntentsListItem from "components/RenameIntentsListItem";
import useAgentStore, { IntentToRename } from "hooks/useAgentStore";
import { IntentListItem } from "hooks/useAgentStore/types";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ListGroup } from "react-bootstrap";

export default function IntentListPage() {
  const [{ filterFunction, renameFunction }, setFilterAndRenameFn] = useState<{
    filterFunction: IntentFilterFn;
    renameFunction: IntentRenameFn;
  }>({
    filterFunction: () => true,
    renameFunction: (name) => name,
  });
  const { intentList, renameIntents } = useAgentStore();

  const sortByIntentName = useCallback(
    (
      { intent: a }: IntentListItem,
      { intent: b }: IntentListItem
    ): -1 | 0 | 1 => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0),
    []
  );

  const addNewNameToItem = useCallback(
    (item: IntentListItem) => ({
      ...item,
      newName: renameFunction(item.intent.name),
    }),
    [renameFunction]
  );

  const intents: IntentToRename[] = useMemo(
    () =>
      intentList
        .slice()
        .filter(filterFunction)
        .sort(sortByIntentName)
        .map(addNewNameToItem),
    [intentList, filterFunction, sortByIntentName, addNewNameToItem]
  );

  const [hasCollision, nameCounter] = useMemo(
    () =>
      intents.reduce(
        ([collision, counter], { newName }) => {
          counter[newName] = newName in counter ? counter[newName] + 1 : 1;

          return [collision || counter[newName] > 1, counter];
        },
        [false, {}] as [boolean, Record<string, number>]
      ),
    [intents]
  );

  const disableRename = useMemo(() => hasCollision || intents.length === 0, [
    hasCollision,
    intents.length,
  ]);

  const handleSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>): Promise<void> => {
      ev.preventDefault();
      ev.stopPropagation();
      if (disableRename) return;

      await renameIntents(intents);
    },
    [disableRename, intents, renameIntents]
  );

  const handleFormChange = useCallback(
    (filterFunction: IntentFilterFn, renameFunction: IntentRenameFn): void => {
      setFilterAndRenameFn({ filterFunction, renameFunction });
    },
    []
  );

  return (
    <div>
      <h1>Intent List/Rename</h1>
      <RenameIntentsForm
        {...{ handleSubmit, disableRename }}
        onFormChange={handleFormChange}
      />
      {hasCollision && (
        <Alert variant="danger" className="text-center">
          Can't rename because some intent names are duplicated!
        </Alert>
      )}
      Matched {intents.length} intents.
      <ListGroup>
        {intents &&
          intents.map(({ intent, newName }) => (
            <RenameIntentsListItem
              key={intent.id}
              newName={newName}
              intent={intent}
              hasCollision={nameCounter[newName] > 1}
            />
          ))}
      </ListGroup>
    </div>
  );
}
