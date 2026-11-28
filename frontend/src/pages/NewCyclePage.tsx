import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../api/client";
import { Button } from "../design/components/Button";
import { TextField } from "../design/components/TextField";
import { addDays, today } from "./format";
import styles from "./pages.module.css";
import { ErrorMessage } from "./Status";

type Errors = Partial<Record<"hypothesis" | "method" | "startDate" | "endDate", string>>;

/** サイクルの作成。仮説、検証方法、期間を登録します。 */
export function NewCyclePage() {
  const navigate = useNavigate();
  const [hypothesis, setHypothesis] = useState("");
  const [method, setMethod] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() => addDays(today(), 14));
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (hypothesis.trim() === "") next.hypothesis = "仮説を入力してください";
    if (method.trim() === "") next.method = "検証方法を入力してください";
    if (startDate === "") next.startDate = "開始日を入力してください";
    if (endDate === "") next.endDate = "終了予定日を入力してください";
    else if (startDate !== "" && endDate < startDate) {
      next.endDate = "終了予定日は開始日以降にしてください";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitFailed(false);
    try {
      const cycle = await api.createCycle({
        hypothesis: hypothesis.trim(),
        method: method.trim(),
        start_date: startDate,
        end_date: endDate,
      });
      void navigate(`/cycles/${cycle.id}`);
    } catch {
      setSubmitFailed(true);
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>仮説を追加</h2>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="仮説"
          description="例: 朝に散歩すると、その日を穏やかに過ごせる"
          value={hypothesis}
          onChange={setHypothesis}
          errorMessage={errors.hypothesis}
          maxLength={200}
        />
        <TextField
          label="検証方法"
          description="例: 起きたら 15 分、近所を歩く"
          value={method}
          onChange={setMethod}
          errorMessage={errors.method}
          maxLength={1000}
          multiline
        />
        <div className={styles.row}>
          <TextField
            label="開始日"
            type="date"
            value={startDate}
            onChange={setStartDate}
            errorMessage={errors.startDate}
          />
          <TextField
            label="終了予定日"
            type="date"
            value={endDate}
            onChange={setEndDate}
            errorMessage={errors.endDate}
          />
        </div>
        {submitFailed && <ErrorMessage>保存できませんでした。もう一度お試しください</ErrorMessage>}
        <div className={styles.actions}>
          <Button variant="text" onPress={() => void navigate("/")}>
            キャンセル
          </Button>
          <Button type="submit" isDisabled={isSubmitting}>
            作成する
          </Button>
        </div>
      </form>
    </div>
  );
}
