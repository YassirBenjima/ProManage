"use client";
import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Delete",
  description = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-base-100 rounded-xl shadow-xl border border-base-300 w-11/12 max-w-sm p-5">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-base-content/80 mb-5">{description}</p>
        <div className="flex justify-end gap-2">
          <button className="btn btn-sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
