import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Divider, Switch, FormControlLabel, Avatar, Tab, Tabs, Snackbar, Alert,
} from '@mui/material';
import { Save, PhotoCamera, Business, Person, Notifications, Security } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/api';

export const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [garageData, setGarageData] = useState({
    name: user?.garage?.name || '',
    phone: user?.garage?.phone || '',
    address: user?.garage?.address || '',
    taxRate: 15,
    currency: 'SAR',
  });

  const handleProfileSave = async () => {
    try {
      await apiService.put('/auth/me', profileData);
      setSnackbar({ open: true, message: 'تم حفظ الملف الشخصي بنجاح', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'فشل حفظ الملف الشخصي', severity: 'error' });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: 'كلمة المرور الجديدة غير متطابقة', severity: 'error' });
      return;
    }
    try {
      await apiService.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSnackbar({ open: true, message: 'تم تغيير كلمة المرور بنجاح', severity: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setSnackbar({ open: true, message: 'فشل تغيير كلمة المرور', severity: 'error' });
    }
  };

  const handleGarageSave = async () => {
    try {
      await apiService.put(`/garages/${user?.garage?.id}`, garageData);
      setSnackbar({ open: true, message: 'تم حفظ إعدادات الورشة بنجاح', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'فشل حفظ إعدادات الورشة', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>الإعدادات</Typography>

      <Tabs value={tab} onChange={(_: any, v: number) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<Person />} label="الملف الشخصي" iconPosition="start" />
        <Tab icon={<Business />} label="إعدادات الورشة" iconPosition="start" />
        <Tab icon={<Notifications />} label="الإشعارات" iconPosition="start" />
        <Tab icon={<Security />} label="الأمان" iconPosition="start" />
      </Tabs>

      {/* Personal Profile */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, textAlign: 'center', p: 3 }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, fontSize: '2.5rem', bgcolor: 'primary.main' }}
              >
                {user?.fullName?.[0]}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{user?.fullName}</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>{user?.email}</Typography>
              <Button variant="outlined" startIcon={<PhotoCamera />} size="small">تغيير الصورة</Button>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>المعلومات الشخصية</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="الاسم الكامل" value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="رقم الهاتف" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="الدور" defaultValue={user?.role} disabled />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<Save />} onClick={handleProfileSave}>حفظ التغييرات</Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, mt: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>تغيير كلمة المرور</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="كلمة المرور الحالية" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="كلمة المرور الجديدة" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="تأكيد كلمة المرور" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="warning" startIcon={<Security />} onClick={handlePasswordChange}>تغيير كلمة المرور</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Garage Settings */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>معلومات الورشة</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="اسم الورشة" value={garageData.name} onChange={(e) => setGarageData({ ...garageData, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="رقم الهاتف" value={garageData.phone} onChange={(e) => setGarageData({ ...garageData, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="العنوان" value={garageData.address} multiline rows={2} onChange={(e) => setGarageData({ ...garageData, address: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="نسبة الضريبة (%)" type="number" value={garageData.taxRate} onChange={(e) => setGarageData({ ...garageData, taxRate: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="العملة" value={garageData.currency} onChange={(e) => setGarageData({ ...garageData, currency: e.target.value })} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Save />} onClick={handleGarageSave}>حفظ الإعدادات</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {tab === 2 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>إعدادات الإشعارات</Typography>
            {[
              { label: 'إشعارات الحجوزات الجديدة', desc: 'إشعار عند إنشاء حجز جديد' },
              { label: 'إشعارات بطاقات العمل', desc: 'إشعار عند تغيير حالة بطاقة العمل' },
              { label: 'إشعارات الدفعات', desc: 'إشعار عند استلام دفعة جديدة' },
              { label: 'تنبيهات المخزون', desc: 'إشعار عند انخفاض مستوى المخزون' },
              { label: 'التقارير اليومية', desc: 'ملخص يومي للنشاط' },
            ].map((item, i) => (
              <Box key={i}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>{item.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                    </Box>
                  }
                  sx={{ width: '100%', justifyContent: 'space-between', ml: 0, mb: 1 }}
                  labelPlacement="start"
                />
                {i < 4 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>إعدادات الأمان</Typography>
            <FormControlLabel
              control={<Switch />}
              label={
                <Box>
                  <Typography fontWeight={600}>المصادقة الثنائية</Typography>
                  <Typography variant="caption" color="text.secondary">طبقة حماية إضافية لحسابك</Typography>
                </Box>
              }
              sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
              labelPlacement="start"
            />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label={
                <Box>
                  <Typography fontWeight={600}>تسجيل الأنشطة</Typography>
                  <Typography variant="caption" color="text.secondary">تتبع جميع العمليات في النظام</Typography>
                </Box>
              }
              sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
              labelPlacement="start"
            />
          </CardContent>
        </Card>
      )}

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
