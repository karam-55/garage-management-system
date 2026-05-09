import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button,
  Tab, Tabs, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { FileDownload } from '@mui/icons-material';
import { apiService } from '../../services/api';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2'];

export const Reports: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState('month');

  const { data: revenueData } = useQuery({
    queryKey: ['report-revenue', period],
    queryFn: () => apiService.get(`/reports/admin/overview`).then(r => r.data),
  });

  const { data: bookingData } = useQuery({
    queryKey: ['report-bookings', period],
    queryFn: () => apiService.get(`/bookings?limit=1`).then(r => r.data),
  });

  const { data: inventoryReport } = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => apiService.get('/inventory?limit=1').then(r => r.data),
  });

  const monthlyRevenue = revenueData?.data?.monthlyRevenue || [];
  const serviceDistribution = revenueData?.data?.serviceDistribution || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>التقارير والإحصائيات</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>الفترة</InputLabel>
            <Select value={period} label="الفترة" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="week">أسبوع</MenuItem>
              <MenuItem value="month">شهر</MenuItem>
              <MenuItem value="quarter">ربع سنة</MenuItem>
              <MenuItem value="year">سنة</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<FileDownload />} size="small">تصدير</Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'إجمالي الإيرادات', value: '128,500 ر.س', color: '#1976d2', change: '+12%' },
          { label: 'إجمالي الحجوزات', value: '342', color: '#388e3c', change: '+8%' },
          { label: 'معدل إتمام العمل', value: '94%', color: '#f57c00', change: '+2%' },
          { label: 'رضا العملاء', value: '4.8/5', color: '#7b1fa2', change: '+0.2' },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ borderRadius: 2, borderLeft: `4px solid ${stat.color}` }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                <Typography variant="h5" fontWeight={700} color={stat.color}>{stat.value}</Typography>
                <Typography variant="caption" color="success.main">{stat.change} هذا الشهر</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_: any, v: number) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="الإيرادات" />
        <Tab label="الخدمات" />
        <Tab label="الأداء" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>الإيرادات والمصروفات الشهرية</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RTooltip formatter={(v: number) => `${v.toLocaleString()} ر.س`} />
                    <Legend />
                    <Bar dataKey="revenue" name="الإيرادات" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="المصروفات" fill="#f57c00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>توزيع الخدمات</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={serviceDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                      {serviceDistribution.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>أداء الخدمات</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="الإيرادات" stroke="#1976d2" strokeWidth={2} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>تقارير الأداء قيد التطوير</Typography>
      )}
    </Box>
  );
};
