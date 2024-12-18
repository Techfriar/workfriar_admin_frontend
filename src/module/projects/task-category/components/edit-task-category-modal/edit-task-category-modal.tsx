"use client";
import React from "react";
import ModalFormComponent from "@/themes/components/modal-form/modal-form";
import { TaskCategoryData } from "../../services/task-category-service";

interface EditTaskCategoryModalProps {
  isEditModalOpen: boolean;
  onClose?: () => void;
  onSave: (values: Record<string, any>) => void;
  initialValues: TaskCategoryData | null;
}

const EditTaskCategoryModal: React.FC<EditTaskCategoryModalProps> = ({
  isEditModalOpen,
  onClose,
  onSave,
  initialValues,
}) => {
  const values = initialValues || {
    id: "",
    category: "",
    timeentry: "opened",
  };

  return (
    <ModalFormComponent
      isVisible={isEditModalOpen}
      onClose={onClose}
      title={"Edit Task Category"}
      primaryButtonLabel={"Save"}
      secondaryButtonLabel={"Cancel"}
      initialValues={values}
      onPrimaryClick={onSave}
      formRows={[
        {
          fields: [
            {
              name: "category",
              label: "Task category",
              type: "text",
              required: true,
              placeholder: "Enter task category",
            },
            {
              name: "timeentry",
              label: "Time entry",
              type: "select",
              options: [
                { label: "Opened", value: "opened" },
                { label: "Closed", value: "closed" },
              ],
              required: true,
              placeholder: "Select time entry",
            },
          ],
        },
      ]}
    />
  );
};

export default EditTaskCategoryModal;
