"use client";
import React, { useEffect, useState } from "react";
import { Tooltip, Dropdown, message, Pagination } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CustomTable from "@/themes/components/custom-table/custom-table";
import styles from "./project-status-report.module.scss";
import CustomAvatar from "@/themes/components/avatar/avatar";
import SkeletonLoader from "@/themes/components/skeleton-loader/skeleton-loader";
import UseProjectStatusServices from "../../services/project-status-report/project-status-report-services";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { closeModal } from "@/redux/slices/modalSlice";
import AddReport from "../add-edit-report-modal/add-edit-report-modal";

const ProjectStatusReport: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [totalRecords, setTotalRecords] = useState(0); // Total records for pagination
  const pageSize = 5; // Number of rows per page
  const router = useRouter();
  const dispatch = useDispatch();
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const { isOpen, modalType } = useSelector((state: RootState) => state.modal);
   const [project, setProject] = useState<any>(null);

  const columns = [
    { title: "Project", key: "project", align: "left" as const, width: 200 },
    { title: "Project Lead", key: "projectLead", align: "left" as const },
    {
      title: "Actual Start & End Date",
      key: "date",
      align: "left" as const,
      width: 220,
    },
    {
      title: "Reporting Period",
      key: "reportingPeriod",
      align: "left" as const,
    },
    { title: "Progress", key: "progress", align: "left" as const, width: 100 },
    { title: "Comments", key: "comments", align: "left" as const },
    { title: "", key: "action", align: "left" as const, width: 50 },
  ];

  const menuItems = [
    { key: "Details", label: "Details" },
    { key: "Edit", label: "Edit" },
  ];

  const handleRowClick = (rowId:string) => {
    if (rowId) {
      router.push(`/project-status-report/report-details/${rowId}`); // Navigate to the ID-based page
    }
  };

  const handleMenuClick = async (e: { key: string }, record: any) => {
    if (e.key === "Details") {
      router.push(`/project-status-report/report-details/${record.id}`);
    } else if (e.key === "Edit") {
      setIsEditModalVisible(true);
      const data = await UseProjectStatusServices().fetchProjectDetails(record.id);
      setProject(data.data);
    }
  };

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const reports = await UseProjectStatusServices().fetchProjectStatusReport(
        page,
        pageSize
      ); // Pass page and pageSize to API
      const formattedData = reports.data.map((item: any) => ({
        id: item.id,
        project: (
          <div className={styles.projectCell}>
            <CustomAvatar name={item.project_name} size={50} />
            <button className={styles.projectName}  onClick={() => handleRowClick(item.id)}>{item.project_name}</button>
          </div>
        ),
        projectLead: (
          <div className={styles.projectLeadCell}>
            <div className={styles.name}>{item.project_lead}</div>
          </div>
        ),
        date: (
          <div className={styles.dateCell}>
            <div>
              {item.actual_start_date} - {item.actual_end_date}
            </div>
          </div>
        ),
        reportingPeriod: (
          <div className={styles.reportingCell}>
            <div>{item.reporting_period}</div>
          </div>
        ),
        progress: (
          <div className={styles.progressCell}>
            <div>{item?.progress.includes('%') ? item?.progress : `${item?.progress}%`}</div>
          </div>
        ),
        comments: (
          <div className={styles.commentsCell}>
            <Tooltip title={item.comments}>
            <span>{item.comments?.length > 16 ? `${item.comments.slice(0, 16)}...` : item.comments || "--"}</span>
            </Tooltip>
          </div>
        ),
        action: (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: (e) => handleMenuClick(e, item),
            }}
            trigger={["click"]}
          >
            <span className={styles.deleteButton}>
              <MoreOutlined className={styles.threeDotButton} />
            </span>
          </Dropdown>
        ),
      }));
      setData(formattedData);
      setTotalRecords(reports.total); // Set total records for pagination
    } catch (error) {
      message.error("Failed to fetch project status report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage); // Fetch data for the current page
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page); // Update the current page
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
    setIsEditModalVisible(false)
    fetchData(currentPage);
    
  };

  return (
    <>
      <div className={styles.projectStatusReport}>
        {loading ? (
          <>
            <SkeletonLoader
              count={1}
              paragraph={{ rows: 2 }}
              className={styles.customSkeleton}
              classNameItem={styles.customSkeletonItem}
            />
            <SkeletonLoader
              count={1}
              paragraph={{ rows: 4 }}
              classNameItem={styles.customSkeletonItem}
            />
            <SkeletonLoader
              count={3}
              paragraph={{ rows: 5 }}
              classNameItem={styles.customSkeletonItem}
            />
          </>
        ) : (
          <div className={styles.tableWrapper}>
            <CustomTable columns={columns} data={data} />
          </div>
        )}
      </div>
      <div className={styles.paginationDiv}>
        <Pagination
          className={styles.pagination}
          total={totalRecords}
          pageSize={pageSize}
          current={currentPage}
          onChange={handlePageChange}
          showSizeChanger={false}
          style={{ textAlign: "right", marginTop: "20px" }} // Align bottom-right
        />
      </div>

      {isOpen && <AddReport mode="add" onClose={handleCloseModal} />}
      {isEditModalVisible && (
        <AddReport onClose={handleCloseModal} mode="edit" reportData={project}/>
      )}
    </>
  );
};

export default ProjectStatusReport;
