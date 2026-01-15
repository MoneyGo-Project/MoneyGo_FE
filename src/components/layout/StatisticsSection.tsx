import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TransactionStatisticsResponse } from "../../types/api.types";
import { formatCurrency } from "../../utils/format";

interface StatisticsSectionProps {
  statistics: TransactionStatisticsResponse;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const StatisticsSection = ({ statistics }: StatisticsSectionProps) => {
  // 카테고리 한글 변환
  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      TRANSFER: "송금",
      QR_PAYMENT: "QR결제",
      SCHEDULED_TRANSFER: "예약송금",
      DEPOSIT: "입금",
      SELF_DEPOSIT: "본인 입금",
    };
    return labels[category] || category;
  };

  // 증감률 표시
  const renderChangeRate = (rate: number) => {
    if (rate === 0) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrendingFlatIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            0%
          </Typography>
        </Box>
      );
    }

    const isPositive = rate > 0;
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {isPositive ? (
          <TrendingUpIcon fontSize="small" color="success" />
        ) : (
          <TrendingDownIcon fontSize="small" color="error" />
        )}
        <Typography
          variant="body2"
          color={isPositive ? "success.main" : "error.main"}
          fontWeight="bold"
        >
          {isPositive ? "+" : ""}
          {rate.toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  // 파이 차트 데이터
  const pieChartData = statistics.categoryStatistics.map((cat) => ({
    name: getCategoryLabel(cat.category),
    value: cat.amount,
    percentage: cat.percentage,
  }));

  // 라인 차트 데이터
  const lineChartData = statistics.dailyTrends.map((trend) => ({
    date: new Date(trend.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
    입금: trend.deposit,
    출금: trend.withdrawal,
  }));

  return (
    <Box sx={{ mb: 3 }}>
      {/* 이번달 총 입출금 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                이번달 총 입금
              </Typography>
              <Typography
                variant="h5"
                color="success.main"
                fontWeight="bold"
                gutterBottom
              >
                {formatCurrency(statistics.totalDeposit)}
              </Typography>
              {renderChangeRate(statistics.depositChangeRate)}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                이번달 총 출금
              </Typography>
              <Typography
                variant="h5"
                color="error.main"
                fontWeight="bold"
                gutterBottom
              >
                {formatCurrency(statistics.totalWithdrawal)}
              </Typography>
              {renderChangeRate(statistics.withdrawalChangeRate)}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 카테고리별 지출 비율 */}
      {statistics.categoryStatistics.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              카테고리별 지출
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => {
                    // entry.percent는 Recharts가 자동으로 계산 (0-100 값)
                    // 우리는 percentage 속성을 직접 사용
                    const data = pieChartData.find(
                      (d) => d.name === entry.name
                    );
                    return `${entry.name} ${data?.percentage.toFixed(1)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 일별 트렌드 */}
      {statistics.dailyTrends.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              최근 30일 트렌드
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="입금"
                  stroke="#00C49F"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="출금"
                  stroke="#FF8042"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StatisticsSection;
