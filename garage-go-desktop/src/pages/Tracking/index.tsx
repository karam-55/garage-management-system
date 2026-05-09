import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress, Chip,
  Alert, LinearProgress, Divider, Button,
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot,
} from '@mui/lab';
import { DirectionsCar, Build, CheckCircle, AccessTime, Error as ErrorIcon, Refresh } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { useSearchParams } from 'react-router-dom';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلق',
  CONFIRMED: 'مؤكد',
  IN_PROGRESS: 'قيد العمل',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  NO_SHOW: 'لم يحضر',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'default',
};

export const Tracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => apiService.get(`/bookings/${bookingId}`).then(r => r.data),
    enabled: !!bookingId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: jobCards } = useQuery({
    queryKey: ['job-cards', bookingId],
    queryFn: () => apiService.get(`/job-cards?bookingId=${bookingId}`).then(r => r.data),
    enabled: !!bookingId && booking?.status !== 'PENDING',
    refetchInterval: 10000,
  });

  if (!bookingId) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          لم يتم تحديد رقم الحجز. يرجى مسح رمز QR الصحيح.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          لم يتم العثور على الحجز المحدد. يرجى التأكد من رمز QR والمحاولة مرة أخرى.
        </Alert>
      </Box>
    );
  }

  const progress = booking.status === 'COMPLETED' ? 100 :
                   booking.status === 'IN_PROGRESS' ? 60 :
                   booking.status === 'CONFIRMED' ? 30 :
                   booking.status === 'PENDING' ? 10 : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Box sx={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} mb={1}>
              تتبع حالة السيارة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              رقم الحجز: {booking.id.slice(0, 8)}
            </Typography>
          </Box>
          <Button startIcon={<Refresh />} onClick={() => refetch()} variant="outlined">
            تحديث
          </Button>
        </Box>

        {/* Status Card */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  الحالة الحالية
                </Typography>
                <Chip
                  label={STATUS_LABELS[booking.status] || booking.status}
                  color={STATUS_COLORS[booking.status] || 'default'}
                  size="medium"
                />
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {progress}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  نسبة الإنجاز
                </Typography>
              </Box>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar color="primary" />
              معلومات السيارة
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">الشركة:</Typography>
                <Typography variant="body1" fontWeight={600}>{booking.vehicle?.make}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">الموديل:</Typography>
                <Typography variant="body1" fontWeight={600}>{booking.vehicle?.model}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">اللوحة:</Typography>
                <Typography variant="body1" fontWeight={600}>{booking.vehicle?.plate}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">السنة:</Typography>
                <Typography variant="body1" fontWeight={600}>{booking.vehicle?.year}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Service Info */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build color="primary" />
              الخدمة المطلوبة
            </Typography>
            <Typography variant="body1" fontWeight={600} mb={1}>
              {booking.service?.title}
            </Typography>
            {booking.issues && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" mb={1}>
                  الأعطال الموجودة:
                </Typography>
                <Typography variant="body1">{booking.issues}</Typography>
              </>
            )}
            {booking.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" mb={1}>
                  ملاحظات:
                </Typography>
                <Typography variant="body1">{booking.notes}</Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime color="primary" />
              سير العمل
            </Typography>
            <Timeline>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="success" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" fontWeight={600}>تم استلام السيارة</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(booking.createdAt).toLocaleString('ar-SA')}
                  </Typography>
                </TimelineContent>
              </TimelineItem>

              {booking.status !== 'PENDING' && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" fontWeight={600}>تم تأكيد الحجز</Typography>
                    <Typography variant="body2" color="text.secondary">
                      السيارة جاهزة للعمل
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {booking.status === 'IN_PROGRESS' && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="warning" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" fontWeight={600}>قيد العمل حالياً</Typography>
                    <Typography variant="body2" color="text.secondary">
                      الميكانيكي يعمل على سيارتك
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {booking.status === 'COMPLETED' && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="success" />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" fontWeight={600}>تم الانتهاء</Typography>
                    <Typography variant="body2" color="text.secondary">
                      السيارة جاهزة للاستلام
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {booking.status === 'CANCELLED' && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="error" />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" fontWeight={600}>تم الإلغاء</Typography>
                    <Typography variant="body2" color="text.secondary">
                      تم إلغاء الحجز
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
            </Timeline>
          </CardContent>
        </Card>

        {/* Job Cards */}
        {jobCards && jobCards.data && jobCards.data.length > 0 && (
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                تفاصيل العمل
              </Typography>
              {jobCards.data.map((jobCard: any) => (
                <Box key={jobCard.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body1" fontWeight={600} mb={1}>
                    {jobCard.description || 'عمل عام'}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">الفني:</Typography>
                      <Typography variant="body1">{jobCard.technician?.fullName || 'غير محدد'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">الحالة:</Typography>
                      <Chip label={jobCard.status} size="small" />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            يتم تحديث هذه الصفحة تلقائياً كل 10 ثواني
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {booking.garage?.name} - {booking.garage?.phone}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
