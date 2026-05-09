import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Divider,
  Button,
} from '@mui/material';
import {
  CalendarMonth,
  Assignment,
  Receipt,
  TrendingUp,
  CheckCircle,
  Schedule,
  Warning,
  ArrowForward,
  Person,
  DirectionsCar,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}> = ({ title, value, subtitle, icon, color, trend }) => (
  <Card sx={{ height: '100%', borderRadius: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }} color={color}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <TrendingUp sx={{ fontSize: 14, color: trend >= 0 ? 'success.main' : 'error.main', mr: 0.5 }} />
              <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>
                {trend >= 0 ? '+' : ''}{trend}% هذا الشهر
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: color + '20',
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.get('/reports/admin/overview').then(r => r.data),
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['today-bookings'],
    queryFn: () => apiService.get('/bookings?status=today&limit=5').then(r => r.data),
  });

  const { data: jobCardsData } = useQuery({
    queryKey: ['active-job-cards'],
    queryFn: () => apiService.get('/bookings?status=IN_PROGRESS&limit=5').then(r => r.data),
  });

  const stats = statsData?.data;

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'معلق',
      CONFIRMED: 'مؤكد',
      IN_PROGRESS: 'قيد العمل',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <Box>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>جاري التحميل...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          مرحباً، {user?.fullName} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="حجوزات اليوم"
            value={stats?.operations?.activeBookings ?? 12}
            subtitle="حجز نشط"
            icon={<CalendarMonth />}
            color="#1976d2"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="بطاقات العمل"
            value={stats?.operations?.completedJobs ?? 7}
            subtitle="قيد التنفيذ"
            icon={<Assignment />}
            color="#388e3c"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إيرادات الشهر"
            value={`${(stats?.revenue?.month ?? 24500).toLocaleString()} ر.س`}
            subtitle="إجمالي المدفوعات"
            icon={<Receipt />}
            color="#f57c00"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="فواتير معلقة"
            value={stats?.operations?.pendingPayments ?? 4}
            subtitle="تحتاج متابعة"
            icon={<Warning />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      {/* Content Row */}
      <Grid container spacing={3}>
        {/* Today's Bookings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  حجوزات اليوم
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/bookings')}
                >
                  عرض الكل
                </Button>
              </Box>

              <List disablePadding>
                {(bookingsData?.data || []).map((booking: any, index: number) => (
                  <React.Fragment key={booking.id}>
                    <ListItem
                      disablePadding
                      sx={{ py: 1, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50', borderRadius: 1 } }}
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {booking.customer?.fullName}
                            </Typography>
                            <Chip
                              label={getStatusLabel(booking.status)}
                              color={getStatusColor(booking.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {booking.vehicle?.make} {booking.vehicle?.model} • {booking.service?.title}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < 2 && <Divider variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Job Cards */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  بطاقات العمل النشطة
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/job-cards')}
                >
                  عرض الكل
                </Button>
              </Box>

              <List disablePadding>
                {(jobCardsData?.data || []).map((card: any, index: number) => (
                  <React.Fragment key={card.id}>
                    <ListItem
                      disablePadding
                      sx={{ py: 1, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50', borderRadius: 1 } }}
                      onClick={() => navigate(`/job-cards/${card.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: card.status === 'COMPLETED' ? 'success.light' : 'warning.light' }}>
                          {card.status === 'COMPLETED' ? <CheckCircle color="success" /> : <Schedule color="warning" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {card.jobNumber}
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                              {card.actualCost?.toLocaleString()} ر.س
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            <DirectionsCar sx={{ fontSize: 12, mr: 0.5 }} />
                            {card.booking?.customer?.fullName} • {card.booking?.vehicle?.make} {card.booking?.vehicle?.model}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < 2 && <Divider variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
