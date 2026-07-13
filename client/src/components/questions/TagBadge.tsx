import styles from "./TagBadge.module.css";

export interface TagBadgeProps {
  tag: string;
}

export default function TagBadge({ tag }: TagBadgeProps) {
  return <span className={styles.badge}>{tag}</span>;
}
