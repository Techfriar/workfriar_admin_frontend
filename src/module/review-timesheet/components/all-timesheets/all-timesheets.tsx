"use client";

import React, { useState, useEffect, ReactNode, useRef } from "react";
import CustomTable from "@/themes/components/custom-table/custom-table";
import styles from "./all-timesheets.module.scss";
import TimeInput from "@/themes/components/time-input/time-input";
import ButtonComponent from "@/themes/components/button/button";

import {
  minutesToTime,
  timeToMinutes,
} from "@/utils/timesheet-utils/timesheet-time-formatter";
import {
  TimeEntry,
  TimesheetDataTable,
  WeekDaysData,
} from "@/module/time-sheet/services/time-sheet-services";
import { fetchAllTimeSheetsToReview } from "../../services/review-timesheet-services";
import Icons from "@/themes/images/icons/icons";
import { Dropdown } from "antd";
import TextAreaButton from "@/module/time-sheet/components/text-area-button/text-area-button";

interface AllTimeSheetTableProps {
  startDate: Date | null;
  endDate: Date | null;
}

const ReviewAllTimesheetsTable: React.FC<AllTimeSheetTableProps> = ({
  startDate,
  endDate,
}) => {
  const [timesheetData, setTimeSheetData] = useState<TimesheetDataTable[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<WeekDaysData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTaskDetailModal, setTaskDetailModal] = useState<boolean>(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const textAreaOnclick = (rowIndex: number) => {
    setEditingRowIndex(rowIndex);
    setTaskDetailModal(!showTaskDetailModal);
  };
  const menuItems = [
    { key: "approve", label: "Approve" },
    { key: "reject", label: "Reject" },
  ];

  const handleMenuClick = (e: { key: string }, id?: string) => {
    if (e.key === "approve") {
      // function to approve
    } else if (e.key === "reject") {
      //  function to reject
    }
  };

  // Handle time input changes
  const handleTimeChange = (
    index: number,
    day: WeekDaysData,
    newTime: string
  ) => {
    const updatedData = [...timesheetData];
    const dayIndex = daysOfWeek.indexOf(day);
    updatedData[index].dataSheet[dayIndex].hours = newTime;
    setTimeSheetData(updatedData);
    setUnsavedChanges(true);
  };

  useEffect(() => {
    // Fetch timesheet data based on start and end dates
    fetchAllTimeSheetsToReview(
      startDate,
      endDate,
      setTimeSheetData,
      setLoading,
      setDaysOfWeek
    );
  }, [startDate, endDate]);

  // Calculate total hours for a row
  const calculateTotalHours = (entries: TimeEntry[]) => {
    const totalMinutes = entries.reduce(
      (total, entry) => total + timeToMinutes(entry.hours || "00:00"),
      0
    );
    return minutesToTime(totalMinutes);
  };

  // Map time entries to corresponding week days
  const mapTimeEntriesToWeek = (
    entries: TimeEntry[],
    index: number
  ): Record<string, ReactNode> => {
    const weekMap: Record<string, ReactNode> = {};
    daysOfWeek.forEach((day, dayIndex) => {
      const entry = entries[dayIndex] || {
        hours: "00:00",
        isHoliday: false,
        date: "",
      };
      weekMap[day.name] = (
        <TimeInput
          value={entry.hours}
          setValue={(newTime) => handleTimeChange(index, day, newTime)}
          disabled={entry.isDisabled}
          tooltipContent={
            entry.isDisabled ? "These dates are in next week" : ""
          }
          readOnly={true}
        />
      );
    });
    return weekMap;
  };

  // Calculate total hours by day
  const calculateTotalByDay = () => {
    const dailyTotals: Record<string, number> = {};
    daysOfWeek.forEach((day) => {
      dailyTotals[day.name] = timesheetData.reduce((total, timesheet) => {
        const dayIndex = daysOfWeek.indexOf(day);
        const dayEntry = timesheet.dataSheet[dayIndex];
        return total + timeToMinutes(dayEntry?.hours || "00:00");
      }, 0);
    });

    return dailyTotals;
  };

  // Total row component
  const totalRow = () => {
    const dailyTotals = calculateTotalByDay();
    const totalAllDays = Object.values(dailyTotals).reduce((a, b) => a + b, 0);

    return {
      task: <span className={styles.totalRowTask}>Total</span>,
      details: <span></span>,
      ...Object.fromEntries(
        daysOfWeek.map((day) => [
          day.name,
          <span>{minutesToTime(dailyTotals[day.name])}</span>,
        ])
      ),
      total: (
        <span className={styles.rowWiseTotal}>
          <p>{minutesToTime(totalAllDays)}</p>
        </span>
      ),
      action: <span></span>,
      flag: "rowOfTotal",
    };
  };

  // Save button functionality
  const handleSave = () => {
    setTimeSheetData(timesheetData);
    setUnsavedChanges(false);
    alert("Changes saved successfully!");
  };

  // Submit button functionality
  const handleSubmit = () => {
    handleSave();
    alert("Timesheet data submitted successfully!");
  };

  // Columns and final data
  const columns = [
    { title: "Task", key: "task", width: 140 },
    {
      title: <span style={{ width: "100px" }}>Task Details</span>,
      key: "details",
      width: 155,
    },
    ...daysOfWeek.map((day) => ({
      title: (
        <span
          className={
            day.isHoliday
              ? `${styles.dateTitles} ${styles.holidayDateTitles}` // Apply holiday style
              : styles.dateTitles // Default style
          }
        >
          <p>{day.name}</p>
          <p>{day.formattedDate}</p>
        </span>
      ),
      key: day.name,
    })),
    { title: "Total", key: "total", width: 70 },
    { title: "", key: "action", width: 50 },
  ];

  const data = timesheetData.map((timesheet, index) => {
    const totalHours = calculateTotalHours(timesheet.dataSheet);
    let isDisabled;
    const taskStatusClass =
      timesheet.status === "approved"
        ? styles.approved
        : timesheet.status === "rejected"
        ? styles.rejected
        : "";

    if (timesheet.status === "approved" || timesheet.status === "rejected") {
      isDisabled = true;
    } else {
      isDisabled = false;
    }

    return {
      task: (
        <div className={`${styles.tableDataCell} ${taskStatusClass}`}>
          <span className={styles.taskName}>{timesheet.categoryName}</span>
          <span className={styles.projectName}>{timesheet.projectName}</span>
        </div>
      ),
      details: (
        <TextAreaButton
          buttonvalue={timesheet.taskDetail}
          readOnly={true}
          onclickFunction={() => textAreaOnclick(index)}
          showTaskDetailModal={editingRowIndex === index && showTaskDetailModal}
          value={timesheetData[index].taskDetail}
        />
      ),
      ...mapTimeEntriesToWeek(timesheet.dataSheet, index),
      total: (
        <span className={styles.rowWiseTotal}>
          <p>{totalHours}</p>
        </span>
      ),
      action: (
        <Dropdown
          menu={{
            items: menuItems,
            onClick: (e) => handleMenuClick(e, timesheet.timesheetId),
          }}
          trigger={["click"]}
          disabled={isDisabled}
        >
          <button
            className={styles.action}
            role="button"
            tabIndex={0}
            disabled={isDisabled}
          >
            <span>{Icons.threeDots}</span>
          </button>
        </Dropdown>
      ),
    };
  });

  return (
    <div className={styles.mainContainer}>
      <div className={styles.scrollContainer}>
        <div className={styles.tableWrapper}>
          <CustomTable columns={columns} data={[...data, totalRow()]} />
        </div>
      </div>
      <div className={styles.timesheetNotesWrapper}>
        <h2>Timesheet Note</h2>
        <textarea
          className={styles.timesheetNote}
          placeholder="Write your timesheet note here."
        />
      </div>
      <div className={styles.actionButtons}>
        <ButtonComponent label="Approve" theme="black" onClick={handleSave} />
        <ButtonComponent label="Reject" theme="white" onClick={handleSubmit} />
      </div>
    </div>
  );
};

export default ReviewAllTimesheetsTable;
