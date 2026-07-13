import type { CreateQuestionRequest } from "../../types/question";
import Modal from "../ui/Modal";
import AskQuestionForm from "./AskQuestionForm";

export interface AskQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateQuestionRequest) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export default function AskQuestionModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: AskQuestionModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Ask Question">
      <AskQuestionForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />
    </Modal>
  );
}
