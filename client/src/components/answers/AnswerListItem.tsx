import type { AnswerWithVotes } from "../../types/answer";
import { formatDate } from "../../utils/format-date";
import styles from "./AnswerListItem.module.css";

export interface AnswerListItemProps {
  answer: AnswerWithVotes;
  score: number;
  myVote: 1 | -1 | null;
  onVote: (value: 1 | -1) => void;
}

export default function AnswerListItem({ answer, score, myVote, onVote }: AnswerListItemProps) {
  return (
    <article className={styles.item}>
      <div className={styles.voteColumn} aria-label="Answer score">
        <button
          type="button"
          className={[styles.voteButton, myVote === 1 ? styles.voteButtonActiveUp : ""]
            .filter(Boolean)
            .join(" ")}
          aria-label="Upvote"
          aria-pressed={myVote === 1}
          onClick={() => onVote(1)}
        >
          <span className={styles.arrow} aria-hidden="true">
            ▲
          </span>
        </button>
        <span className={styles.score} aria-live="polite">
          {score}
        </span>
        <button
          type="button"
          className={[styles.voteButton, myVote === -1 ? styles.voteButtonActiveDown : ""]
            .filter(Boolean)
            .join(" ")}
          aria-label="Downvote"
          aria-pressed={myVote === -1}
          onClick={() => onVote(-1)}
        >
          <span className={styles.arrow} aria-hidden="true">
            ▼
          </span>
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.body}>{answer.body}</p>
        <p className={styles.meta}>
          answered {formatDate(answer.createdAt)} by {answer.user.nickname}
        </p>
      </div>
    </article>
  );
}
