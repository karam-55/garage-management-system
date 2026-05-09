import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { addNotification } from '../../store/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const NewCustomer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.post('/auth/register', { ...data, role: 'CUSTOMER' }),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'تم إنشاء العميل بنجاح', severity: 'success' });
      dispatch(addNotification({ type: 'success', message: 'تم إنشاء العميل بنجاح' }));
      setTimeout(() => navigate('/customers'), 1500);
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'فشل إنشاء العميل', severity: 'error' });
      dispatch(addNotification({ type: 'error', message: error.response?.data?.message || 'فشل إنشاء العميل' }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setSnackbar({ open: true, message: 'يرجى ملء جميع الحقول المطلوبة', severity: 'error' });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/customers')}>عودة</Button>
          <Typography variant="h5" fontWeight={700}>عميل جديد</Typography>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="الاسم الكامل"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="كلمة المرور"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" onClick={() => navigate('/customers')}>إلغاء</Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ العميل'}
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
