"use client";
import React, { useEffect, useState } from "react";
import styles from "./timesheet-chart-card.module.scss"; // Adjust the path as needed
import CardSection from "../../card-section/card-section";
import { StatusGauge } from "../timesheet-snap-shot-chart/snap-shot-chart";
import {
  StatsProps,
  TimesheetChartService,
} from "@/module/dashboard/services/timesheet-chart-services/timesheet-chart-services";
import SkeletonLoader from "@/themes/components/skeleton-loader/skeleton-loader";
import ButtonComponent from "@/themes/components/button/button";

const TimesheetSnapshotChartCard: React.FC = () => {
  const [stats, setStats] = useState<StatsProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    window.location.href = "/time-sheet";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedStats =
          await TimesheetChartService.fetchTimesheetChartData();
        console.log(fetchedStats, "in timesheet snap shot");
        setStats(fetchedStats);
      } catch (err) {
        console.error("Error fetching timesheet stats:", err);
        setError("Failed to load timesheet data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <CardSection
      title="Timesheet Snapshot"
      topRightContent={
        loading ? (
          <SkeletonLoader count={1} button={true} />
        ) : (
          <ButtonComponent filter={true} theme="filter" onClick={handleClick} />
        )
      }
      centerContent={
        <div className={styles.donutChart}>
          <div className={styles.donut}></div>
        </div>
      }
      bottomContent={
        loading ? (
          <SkeletonLoader
            count={1}
            title={true}
            paragraph={{ rows: 5 }}
            className={styles.customSkeleton}
            classNameItem={styles.customSkeletonItem}
          />
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.snapshotDetails}>
            <StatusGauge
              saved={stats?.saved ?? 0}
              approved={stats?.approved ?? 0}
              rejected={stats?.rejected ?? 0}
            />
          </div>
        )
      }
      className={styles.snapshotCard}
    />
  );
};

export default TimesheetSnapshotChartCard;
