export type StatisticsPeriod = number;

export type StatisticsPeriodsResponse = {
  periods: { days: number }[];
  defaultDays: number | null;
};

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

export type FeedbackRatingBand = 'low' | 'neutral' | 'high';

export type FeedbackReview = {
  orderId: string;
  orderNumber: string;
  carName: string;
  outcome: 'closed' | 'cancelled';
  rating: number;
  band: FeedbackRatingBand;
  reason: string;
  comment: string;
  respondedAt: string;
};

export type FeedbackStatisticsDashboard = {
  period: { from: string; to: string; days: number };
  thresholds: { lowMax: number; highMin: number };
  summary: {
    ratings: number;
    averageRating: number;
    highPercent: number;
    lowCount: number;
    responseRate: number;
    requestsSent: number;
    responsesToRequests: number;
  };
  distribution: { rating: number; count: number }[];
  byOutcome: {
    code: 'closed' | 'cancelled';
    label: string;
    count: number;
    averageRating: number;
    highPercent: number;
  }[];
  recentReviews: FeedbackReview[];
};

export type MechanicStatistics = {
  total: number;
  inProgress: number;
  completed: number;
};
