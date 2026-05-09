import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  TextField, InputAdornment, LinearProgress, Pagination, Tooltip, Avatar,
} from '@mui/material';
import { Add, Search, Visibility, People, Refresh, Phone, Email } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

export const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => apiService.get(`/users?role=CUSTOMER&search=${search}&page=${page}&limit=15`).then(r => r.data),
  });

  const customers = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>العملاء</Typography>
          <Typography variant="body2" color="text.secondary">إجمالي: {total} عميل</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="تحديث"><IconButton onClick={() => refetch()}><Refresh /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/customers/new')}>عميل جديد</Button>
        </Box>
      </Box>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <TextField
            size="small" placeholder="بحث بالاسم أو الهاتف أو البريد..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ width: 360 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        {isLoading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الهاتف</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>البريد الإلكتروني</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>السيارات</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحجوزات</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>إجمالي الإنفاق</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <People sx={{ fontSize: 48, color: 'grey.300' }} />
                    <Typography color="text.secondary">لا يوجد عملاء</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer: any) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36 }}>
                          {customer.fullName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{customer.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.customer?.type === 'COMPANY' ? 'شركة' : 'فرد'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2">{customer.phone || '—'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2">{customer.email || '—'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{customer._count?.vehicles ?? 0}</TableCell>
                    <TableCell>{customer._count?.customerBookings ?? 0}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary">
                        {customer.totalSpent?.toLocaleString() || 0} ر.س
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="عرض الملف">
                        <IconButton size="small" onClick={() => navigate(`/customers/${customer.id}`)}>
                          <Visibility fontSize="small" />
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
            <Pagination count={totalPages} page={page} onChange={(_: any, v: number) => setPage(v)} color="primary" />
          </Box>
        )}
      </Card>
    </Box>
  );
};
