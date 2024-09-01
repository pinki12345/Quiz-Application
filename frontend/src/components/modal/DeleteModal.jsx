import React from "react";
import styles from "./DeleteModal.module.css";

const DeleteModal = ({ onConfirmDelete, onCancel }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalMessage}>
          <p>Are you confirm you</p>
          <p>want to delete ?</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.confirmButton} onClick={onConfirmDelete}>
            Confirm Delete
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
