import { Modal, Form, Input, Select, DatePicker, Upload, Checkbox } from "antd";
import { useState } from "react";
import { RcFile } from "antd/es/upload";
import styles from "./modal-form.module.scss";
import Icons from "@/themes/images/icons/icons";
import CustomSelect from "../select-field/select-field";

/**
 * Interface for defining a single form field's properties.
 */
interface FormField {
  name: string;
  label: string;
  type: "text" | "select" | "date" | "textarea" | "image" | "checkboxSelect";
  required?: boolean;
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  isExtended?: boolean;
  readonly?: boolean;
  triggerElement?: React.ReactNode;
}

/**
 * Interface for defining a row of form fields.
 */
export interface FormRow {
  fields: [FormField, FormField?];
}

/**
 * Props interface for the ModalFormComponent.
 */
interface ModalFormProps {
  isVisible: boolean;
  title: string;
  formRows: FormRow[];
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
  onPrimaryClick?: (values: Record<string, any>) => void;
  onSecondaryClick?: () => void;
  onClose?: () => void;
  initialValues?: Record<string, any>;
  formErrors?: Record<string, any>; 
  children?: React.ReactNode;
}

const ModalFormComponent: React.FC<ModalFormProps> = ({
  isVisible,
  title,
  formRows,
  primaryButtonLabel,
  secondaryButtonLabel,
  onPrimaryClick,
  onSecondaryClick,
  onClose,
  initialValues = {},
  formErrors,
  children,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialValues?.image || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const projectName = initialValues.projectName || "Project";

  /**
   * Handles form submission by validating fields and triggering the onPrimaryClick callback.
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (imageFile) {
        // Replace the filename with the actual File object
        values.project_logo = imageFile;
      }
      
      console.log('Submitting with file:', imageFile); // Debug log
      console.log('Final form values:', values); 
      onPrimaryClick?.(values);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  /**
   * Resets the form fields and triggers the onClose callback.
   */
  const handleClose = () => {
    form.resetFields();
    setImageFile(null); 
    onClose?.();
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      
      case "select":
        return (
          <Select
            placeholder={field.placeholder}
            options={field.options}
            showSearch
            value={form.getFieldValue(field.name)}
          />
        );
        case "checkboxSelect":
          return (
            <Select
              mode="multiple"
              placeholder={field.placeholder || "Select options"}
              options={field.options}
              value={form.getFieldValue(field.name) || []} // Ensure it's an array
              onChange={(selectedValues) => {
                form.setFieldValue(field.name, selectedValues);
              }}
              dropdownRender={(menu) => (
                <div>
                  {field.options?.map((option) => (
                    <div
                      key={option.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "5px 10px",
                      }}
                    >
                      <Checkbox
                        checked={form
                          .getFieldValue(field.name)
                          ?.includes(option.value)} // Check based on initial values
                        onChange={(e) => {
                          const currentValue = form.getFieldValue(field.name) || [];
                          const newValue = e.target.checked
                            ? [...currentValue, option.value]
                            : currentValue.filter(
                                (val: string | number) => val !== option.value
                              );
                          form.setFieldValue(field.name, newValue); // Update form value
                        }}
                        className={styles.checkbox}
                      />
                      <span style={{ marginLeft: "8px" }}>{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          );
        
      case "date":
        return (
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder={field.placeholder || "dd/mm/yyyy"}
            suffixIcon={Icons.calender}
          />
        );
      case "textarea":
        return <Input.TextArea placeholder={field.placeholder} rows={4} />;
      case "image":
        return (
          <div className={styles.imageUploadContainer}>
            <div className={styles.imageCircle}>
              {imageUrl ? (
                <img src={imageUrl} alt="Profile" className={styles.image} />
              ) : (
                <span className={styles.imageInitial}>
                  {projectName[0].toUpperCase()}
                </span>
              )}
            </div>
            <Upload
              showUploadList={false}
              
              beforeUpload={(file: RcFile) => {
                // Convert the image to a base64 string for form submission
                const previewUrl = URL.createObjectURL(file);
                setImageUrl(previewUrl);
                
                // Store the actual file object
                setImageFile(file);
                
                // Set a placeholder value in form
                form.setFieldValue(field.name, file.name);

                return false;
              }}
              accept="image/*"
            >
              {field.triggerElement || (
                <a href="#" className={styles.changeImageLink}>
                  Project logo
                </a>
              )}
            </Upload>
          </div>
        );
      default:
        return (
          <Input placeholder={field.placeholder} readOnly={field.readonly} />
        );
    }
  };

  return (
    <Modal
      open={isVisible}
      title={<div className={styles.modalTitle}>{title}</div>}
      onCancel={handleClose}
      footer={null}
      width={610}
      className={styles.customModal}
    >
    {children && <div className={styles.modalChildren}>{children}</div>}
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        requiredMark={false}
      >
        {formRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`${styles.formRow} ${
              row.fields.length === 1 ? styles.singleField : styles.multiField
            }`}
          >
            {row.fields.map(
              (field, fieldIndex) =>
                field && (
                  <div
                    key={field.name}
                    className={`${styles.formField} ${
                      field.isExtended ? styles.extendedField : ""
                    }`}
                  >
                    <Form.Item
                      name={field.name}
                      rules={
                        field.required
                          ? [
                              {
                                required: true,
                                message: `Please input ${field.label}!`,
                              },
                            ]
                          : []
                      }
                      label={
                        field.type === "image" ? null : (
                          <>
                            {field.label}{" "}
                            {field.required && (
                              <span style={{ color: "red" }}>*</span>
                            )}
                          </>
                        )
                      }
                      style={field.type === "image" ? { marginBottom: 0 } : {}}
                      help={formErrors?.[field.name]} // Dynamically render the error message
                      validateStatus={formErrors?.[field.name] ? "error" : undefined}
                    >
                      {renderField(field)}
                    </Form.Item>
                  </div>
                )
            )}
          </div>
        ))}
      </Form>

      <div className={styles.buttonsContainer}>
        <button
          onClick={onSecondaryClick || handleClose}
          className={styles.secondaryButton}
        >
          {secondaryButtonLabel}
        </button>
        <button onClick={handleSubmit} className={styles.primaryButton}>
          {primaryButtonLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ModalFormComponent;
