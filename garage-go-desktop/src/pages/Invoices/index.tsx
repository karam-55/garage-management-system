import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  TextField, InputAdornment, LinearProgress, Pagination, Tooltip,
} from '@mui/material';
import { Add, Search, Visibility, Receipt, Refresh, Send, Payment } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة', SENT: 'مُرسلة', PAID: 'مدفوعة',
  OVERDUE: 'متأخرة', CANCELLED: 'ملغية', REFUNDED: 'مستردة',
};
const STATUS_COLORS: Record<string, any> = {
  DRAFT: 'default', SENT: 'info', PAID: 'success',
  OVERDUE: 'error', CANCELLED: 'default', REFUNDED: 'warning',
};

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['invoices', search, page],
    queryFn: () => apiService.get(`/invoices?search=${search}&page=${page}&limit=15`).then(r => r.data),
  });

  const invoices = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>الفواتير</Typography>
          <Typography variant="body2" color="text.secondary">إجمالي: {total} فاتورة</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="تحديث"><IconButton onClick={() => refetch()}><Refresh /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<Add />}>فاتورة جديدة</Button>
        </Box>
      </Box>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <TextField
            size="small" placeholder="بحث برقم الفاتورة أو العميل..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ width: 320 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        {isLoading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>رقم الفاتورة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>التاريخ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الاستحقاق</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>المبلغ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Receipt sx={{ fontSize: 48, color: 'grey.300' }} />
                    <Typography color="text.secondary">لا توجد فواتير</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv: any) => (
                  <TableRow key={inv.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary">{inv.invoiceNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{inv.customer?.fullName}</Typography>
                    </TableCell>
                    <TableCell>{new Date(inv.invoiceDate).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' ? 'error.main' : 'text.primary'}
                      >
                        {new Date(inv.dueDate).toLocaleDateString('ar-SA')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{inv.total?.toLocaleString()} ر.س</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABELS[inv.status] || inv.status}
                        color={STATUS_COLORS[inv.status]} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="عرض"><IconButton size="small" onClick={() => navigate(`/invoices/${inv.id}`)}><Visibility fontSize="small" /></IconButton></Tooltip>
                      {inv.status === 'DRAFT' && (
                        <Tooltip title="إرسال"><IconButton size="small" color="info"><Send fontSize="small" /></IconButton></Tooltip>
                      )}
                      {['SENT', 'OVERDUE'].includes(inv.status) && (
                        <Tooltip title="تسجيل دفعة"><IconButton size="small" color="success"><Payment fontSize="small" /></IconButton></Tooltip>
                      )}
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
