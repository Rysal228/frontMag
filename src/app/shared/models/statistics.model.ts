export type StatisticsPeriod = 7 | 30 | 90;

export type StatisticsSummary = {
  orders: number;
  completed: number;
  workAmount: number;
  occupancyPercent: number;
};

export type OrdersTrendPoint = {
  date: string;
  count: number;
};

export type StatusDistributionPoint = {
  code: string;
  name: string;
  count: number;
};

export type WorkTypeStatisticsPoint = {
  id: string;
  name: string;
  count: number;
};

export type WeekdayOccupancyPoint = {
  weekday: number;
  weekdayName: string;
  busy: number;
  capacity: number;
  percent: number;
};

export type StatisticsDashboard = {
  period: { from: string; to: string; days: number };
  summary: StatisticsSummary;
  ordersTrend: OrdersTrendPoint[];
  statusDistribution: StatusDistributionPoint[];
  topWorkTypes: WorkTypeStatisticsPoint[];
  weekdayOccupancy: WeekdayOccupancyPoint[];
};
