import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tooltip,
  LinearProgress, Pagination,
} from '@mui/material';
import {
  Add, Search, Edit, Visibility, Delete, CalendarMonth,
  CheckCircle, Cancel, Refresh,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { useDispatch } from 'react-redux';

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

export const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; bookingId: string; action: string }>({
    open: false, bookingId: '', action: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bookings', search, statusFilter, page],
    queryFn: () => apiService.get(`/bookings?search=${search}&status=${statusFilter}&page=${page}&limit=15`).then(r => r.data),
  });

  const confirmMutation = useMutation({
    mutationFn: (bookingId: string) => apiService.put(`/bookings/${bookingId}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      dispatch(addNotification({ type: 'success', message: 'تم تأكيد الحجز بنجاح' }));
      setConfirmDialog({ open: false, bookingId: '', action: '' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => apiService.put(`/bookings/${bookingId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      dispatch(addNotification({ type: 'success', message: 'تم إلغاء الحجز' }));
      setConfirmDialog({ open: false, bookingId: '', action: '' });
    },
  });

  const handleAction = () => {
    if (confirmDialog.action === 'confirm') {
      confirmMutation.mutate(confirmDialog.bookingId);
    } else if (confirmDialog.action === 'cancel') {
      cancelMutation.mutate(confirmDialog.bookingId);
    }
  };

  const bookings = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>الحجوزات</Typography>
          <Typography variant="body2" color="text.secondary">إجمالي: {total} حجز</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="تحديث">
            <IconButton onClick={() => refetch()}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/bookings/new')}>
            حجز جديد
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth size="small" placeholder="بحث باسم العميل أو السيارة..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>الحالة</InputLabel>
                <Select value={statusFilter} label="الحالة" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">الكل</MenuItem>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 2 }}>
        {isLoading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>السيارة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الخدمة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>التاريخ والوقت</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CalendarMonth sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                    <Typography color="text.secondary">لا توجد حجوزات</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking: any, index: number) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{booking.customer?.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.customer?.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{booking.vehicle?.make} {booking.vehicle?.model}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.vehicle?.plate}</Typography>
                    </TableCell>
                    <TableCell>{booking.service?.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(booking.scheduledAt).toLocaleDateString('ar-SA')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(booking.scheduledAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[booking.status] || booking.status}
                        color={STATUS_COLORS[booking.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="عرض">
                        <IconButton size="small" onClick={() => navigate(`/bookings/${booking.id}`)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {booking.status === 'PENDING' && (
                        <Tooltip title="تأكيد">
                          <IconButton size="small" color="success"
                            onClick={() => setConfirmDialog({ open: true, bookingId: booking.id, action: 'confirm' })}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <Tooltip title="إلغاء">
                          <IconButton size="small" color="error"
                            onClick={() => setConfirmDialog({ open: true, bookingId: booking.id, action: 'cancel' })}>
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="تعديل">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/bookings/${booking.id}`)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, bookingId: '', action: '' })}>
        <DialogTitle>
          {confirmDialog.action === 'confirm' ? 'تأكيد الحجز' : 'إلغاء الحجز'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'confirm'
              ? 'هل تريد تأكيد هذا الحجز؟'
              : 'هل تريد إلغاء هذا الحجز؟'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, bookingId: '', action: '' })}>إغلاق</Button>
          <Button
            variant="contained"
            color={confirmDialog.action === 'confirm' ? 'success' : 'error'}
            onClick={handleAction}
            disabled={confirmMutation.isPending || cancelMutation.isPending}
          >
            {confirmDialog.action === 'confirm' ? 'تأكيد' : 'إلغاء الحجز'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
