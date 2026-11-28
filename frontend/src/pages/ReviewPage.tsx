import { type FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ApiError, api } from "../api/client";
import type { CycleDetail } from "../api/schema";
import { Button } from "../design/components/Button";
import { CardLink } from "../design/components/CardLink";
import { Radio, RadioGroup } from "../design/components/RadioGroup";
import { TextField } from "../design/components/TextField";
import { formatPeriod, VERDICT_LABELS, type Verdict } from "./format";
import styles from "./pages.module.css";
import { StatsList } from "./StatsList";
import { ErrorMessage, Loading } from "./Status";
import { useLoad } from "./useLoad";

const VERDICTS: Verdict[] = ["supported", "not_supported", "inconclusive"];

/** 振り返り。判定とわかったことを残してサイクルを完了します。 */
export function ReviewPage() {
  const cycleId = Number(useParams().id);
  const [state] = useLoad((signal) => api.getCycle(cycleId, signal), [cycleId]);

  if (state.status === "loading") return <Loading />;
  if (state.status === "error") {
    return (
      <ErrorMessage>
        {state.httpStatus === 404 ? "検証が見つかりません" : "検証を読み込めませんでした"}
      </ErrorMessage>
    );
  }
  return <ReviewForm cycle={state.data} />;
}

function ReviewForm({ cycle }: { cycle: CycleDetail }) {
  const navigate = useNavigate();
  const [verdict, setVerdict] = useState("");
  const [learnings, setLearnings] = useState("");
  const [verdictError, setVerdictError] = useState<string>();
  const [learningsError, setLearningsError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextVerdictError = verdict === "" ? "判定を選んでください" : undefined;
    const nextLearningsError =
      learnings.trim() === "" ? "わかったことを入力してください" : undefined;
    setVerdictError(nextVerdictError);
    setLearningsError(nextLearningsError);
    if (nextVerdictError || nextLearningsError) return;

    setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      await api.completeCycle(cycle.id, {
        verdict: verdict as Verdict,
        learnings: learnings.trim(),
      });
      void navigate(`/cycles/${cycle.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.status === 409
          ? "この検証はすでに完了しています"
          : "保存できませんでした。もう一度お試しください",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>振り返り</h2>
      <CardLink href={`/cycles/${cycle.id}`} variant="outlined" className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{cycle.hypothesis}</h3>
        <p className={styles.muted}>{formatPeriod(cycle.start_date, cycle.end_date)}</p>
      </CardLink>

      <section className={styles.section} aria-labelledby="review-stats-heading">
        <h3 id="review-stats-heading" className={styles.sectionTitle}>
          集計
        </h3>
        <StatsList stats={cycle.stats} />
      </section>

      {cycle.status === "completed" ? (
        <p className={styles.muted}>この検証はすでに完了しています</p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <RadioGroup
            label="判定"
            value={verdict}
            onChange={setVerdict}
            errorMessage={verdictError}
          >
            {VERDICTS.map((value) => (
              <Radio key={value} value={value}>
                {VERDICT_LABELS[value]}
              </Radio>
            ))}
          </RadioGroup>
          <TextField
            label="わかったこと"
            value={learnings}
            onChange={setLearnings}
            errorMessage={learningsError}
            maxLength={2000}
            multiline
          />
          {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
          <div className={styles.actions}>
            <Button variant="text" onPress={() => void navigate(`/cycles/${cycle.id}`)}>
              キャンセル
            </Button>
            <Button type="submit" isDisabled={isSubmitting}>
              完了する
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
