import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Divider, Snackbar, Alert,
  CircularProgress, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { Save, ArrowBack, Add, Print } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { addNotification } from '../../store/slices/uiSlice';
import { useDispatch } from 'react-redux';
import { BookingPrint } from '../../components/BookingPrint';

export const NewBooking: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const [printDialog, setPrintDialog] = useState<{ open: boolean; booking: any }>({
    open: false, booking: null,
  });

  const [formData, setFormData] = useState({
    garageId: '',
    customerId: '',
    vehicleId: '',
    serviceId: '',
    scheduledAt: '',
    issues: '',
    notes: '',
  });

  // Fetch garages
  const { data: garages, isLoading: garagesLoading } = useQuery({
    queryKey: ['garages'],
    queryFn: () => apiService.get('/garages').then(r => r.data),
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiService.get('/users?role=CUSTOMER').then(r => r.data),
  });

  // Fetch vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => apiService.get('/vehicles').then(r => r.data),
  });

  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiService.get('/services').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.post('/bookings', data),
    onSuccess: (response) => {
      setSnackbar({ open: true, message: 'تم إنشاء الحجز بنجاح', severity: 'success' });
      dispatch(addNotification({ type: 'success', message: 'تم إنشاء الحجز بنجاح' }));
      setPrintDialog({ open: true, booking: response.data.data });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'فشل إنشاء الحجز', severity: 'error' });
      dispatch(addNotification({ type: 'error', message: error.response?.data?.message || 'فشل إنشاء الحجز' }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.garageId || !formData.customerId || !formData.vehicleId || !formData.serviceId || !formData.scheduledAt) {
      setSnackbar({ open: true, message: 'يرجى ملء جميع الحقول المطلوبة', severity: 'error' });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/bookings')}>عودة</Button>
          <Typography variant="h5" fontWeight={700}>حجز جديد</Typography>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          {garagesLoading || customersLoading || vehiclesLoading || servicesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>العميل</InputLabel>
                    <Select
                      value={formData.customerId}
                      label="العميل"
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      required
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton onClick={() => navigate('/customers/new')} size="small">
                            <Add />
                          </IconButton>
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="" disabled>اختر العميل</MenuItem>
                      {customers?.data?.map((customer: any) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.fullName} - {customer.phone}
                        </MenuItem>
                      ))}
                      <MenuItem onClick={() => navigate('/customers/new')} divider>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Add fontSize="small" />
                          إضافة عميل جديد
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>الكراج</InputLabel>
                    <Select
                      value={formData.garageId}
                      label="الكراج"
                      onChange={(e) => setFormData({ ...formData, garageId: e.target.value })}
                      required
                    >
                      {garages?.data?.map((garage: any) => (
                        <MenuItem key={garage.id} value={garage.id}>
                          {garage.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>السيارة</InputLabel>
                    <Select
                      value={formData.vehicleId}
                      label="السيارة"
                      onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                      required
                    >
                      {vehicles?.data?.map((vehicle: any) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} - {vehicle.plate}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>الخدمة</InputLabel>
                    <Select
                      value={formData.serviceId}
                      label="الخدمة"
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      required
                    >
                      {services?.data?.map((service: any) => (
                        <MenuItem key={service.id} value={service.id}>
                          {service.title} - {service.price} ر.س
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="التاريخ والوقت"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="الأعطال الموجودة"
                    multiline
                    rows={3}
                    value={formData.issues}
                    onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                    placeholder="صف الأعطال التي يشتكي منها العميل..."
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ملاحظات إضافية"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أي ملاحظات إضافية..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate('/bookings')}>إلغاء</Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      type="submit"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ الحجز'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Print Dialog */}
      <Dialog open={printDialog.open} onClose={() => setPrintDialog({ open: false, booking: null })} maxWidth="lg" fullWidth>
        <DialogTitle>طباعة ورقة الحجز</DialogTitle>
        <DialogContent>
          {printDialog.booking && (
            <BookingPrint
              booking={printDialog.booking}
              garage={garages?.data?.find((g: any) => g.id === printDialog.booking.garageId)}
              customer={customers?.data?.find((c: any) => c.id === printDialog.booking.userId)}
              vehicle={vehicles?.data?.find((v: any) => v.id === printDialog.booking.vehicleId)}
              service={services?.data?.find((s: any) => s.id === printDialog.booking.serviceId)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
