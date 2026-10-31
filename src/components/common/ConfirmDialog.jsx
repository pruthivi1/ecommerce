import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className={tone === "danger" ? "bg-error-600 hover:bg-error-700 border-error-600" : ""}
          >
            {loading ? "Please wait…" : confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm text-text-secondary">{description}</p>}
    </Modal>
  );
}
