import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Divider, Snackbar, Alert,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';

export const NewJobCard: React.FC = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const [formData, setFormData] = useState({
    bookingId: '',
    vehicleId: '',
    technicianId: '',
    bayId: '',
    customerComplaint: '',
    estimatedCost: 0,
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiService.get('/bookings?status=PENDING').then(r => r.data),
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => apiService.get('/vehicles').then(r => r.data),
  });

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => apiService.get('/users?role=MECHANIC').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.post('/job-cards', data),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'تم إنشاء بطاقة العمل بنجاح', severity: 'success' });
      setTimeout(() => navigate('/job-cards'), 1500);
    },
    onError: () => {
      setSnackbar({ open: true, message: 'فشل إنشاء بطاقة العمل', severity: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/job-cards')}>عودة</Button>
          <Typography variant="h5" fontWeight={700}>بطاقة عمل جديدة</Typography>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>الحجز</InputLabel>
                  <Select
                    value={formData.bookingId}
                    label="الحجز"
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                  >
                    {bookings?.data?.map((booking: any) => (
                      <MenuItem key={booking.id} value={booking.id}>
                        {booking.customer?.fullName} - {booking.vehicle?.make} {booking.vehicle?.model}
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
                  <InputLabel>الفني</InputLabel>
                  <Select
                    value={formData.technicianId}
                    label="الفني"
                    onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                  >
                    {technicians?.data?.map((tech: any) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        {tech.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="التكلفة المقدرة"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="شكوى العميل"
                  multiline
                  rows={4}
                  value={formData.customerComplaint}
                  onChange={(e) => setFormData({ ...formData, customerComplaint: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" onClick={() => navigate('/job-cards')}>إلغاء</Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ البطاقة'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
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
    </Box>
  );
};
