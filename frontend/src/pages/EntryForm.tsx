import { type FormEvent, useState } from "react";
import { ApiError, api } from "../api/client";
import type { CycleDetail } from "../api/schema";
import { Button } from "../design/components/Button";
import { Checkbox } from "../design/components/Checkbox";
import { Radio, RadioGroup } from "../design/components/RadioGroup";
import { TextField } from "../design/components/TextField";
import { HAPPINESS_LABELS, today } from "./format";
import styles from "./pages.module.css";
import { ErrorMessage } from "./Status";

const HAPPINESS_VALUES = [1, 2, 3, 4, 5];

function savedValues(cycle: CycleDetail, date: string) {
  const entry = cycle.entries.find((item) => item.date === date);
  return {
    practiced: entry?.practiced ?? false,
    happiness: entry ? String(entry.happiness) : "",
    note: entry?.note ?? "",
  };
}

function saveErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "完了した検証には記録できません";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "この日付には記録できません。開始日から今日までの日付を選んでください";
  }
  return "保存できませんでした。もう一度お試しください";
}

/** 1 日分の記録フォーム。選んだ日に記録があれば、その値を入れておきます。 */
export function EntryForm({
  cycle,
  onSaved,
}: {
  cycle: CycleDetail;
  onSaved: (cycle: CycleDetail) => void;
}) {
  const maxDate = today();
  const [date, setDate] = useState(maxDate);
  const [values, setValues] = useState(() => savedValues(cycle, maxDate));
  const [dateError, setDateError] = useState<string>();
  const [happinessError, setHappinessError] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [savedMessage, setSavedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (maxDate < cycle.start_date) {
    return <p className={styles.muted}>開始日になると記録できます</p>;
  }

  function changeDate(next: string) {
    setDate(next);
    setValues(savedValues(cycle, next));
    setSavedMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextDateError =
      date < cycle.start_date || date > maxDate
        ? "開始日から今日までの日付を選んでください"
        : undefined;
    const nextHappinessError = values.happiness === "" ? "幸福度を選んでください" : undefined;
    setDateError(nextDateError);
    setHappinessError(nextHappinessError);
    if (nextDateError || nextHappinessError) return;

    setIsSaving(true);
    setSaveError(undefined);
    setSavedMessage("");
    try {
      await api.upsertEntry(cycle.id, date, {
        practiced: values.practiced,
        happiness: Number(values.happiness),
        note: values.note,
      });
      onSaved(await api.getCycle(cycle.id));
      setSavedMessage("記録を保存しました");
    } catch (error) {
      setSaveError(saveErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="日付"
        type="date"
        value={date}
        onChange={changeDate}
        description="開始日から今日までの日付を選べます"
        errorMessage={dateError}
      />
      <Checkbox
        isSelected={values.practiced}
        onChange={(practiced) => setValues((current) => ({ ...current, practiced }))}
      >
        実行した
      </Checkbox>
      <RadioGroup
        label="幸福度"
        orientation="horizontal"
        value={values.happiness}
        onChange={(happiness) => setValues((current) => ({ ...current, happiness }))}
        errorMessage={happinessError}
      >
        {HAPPINESS_VALUES.map((value) => (
          <Radio key={value} value={String(value)}>
            {value} {HAPPINESS_LABELS[value]}
          </Radio>
        ))}
      </RadioGroup>
      <TextField
        label="メモ"
        value={values.note}
        onChange={(note) => setValues((current) => ({ ...current, note }))}
        maxLength={2000}
        multiline
      />
      {saveError && <ErrorMessage>{saveError}</ErrorMessage>}
      <div className={styles.actions}>
        <p className={styles.success} role="status">
          {savedMessage}
        </p>
        <Button type="submit" isDisabled={isSaving}>
          記録を保存
        </Button>
      </div>
    </form>
  );
}
