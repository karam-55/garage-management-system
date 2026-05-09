import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  TextField, InputAdornment, LinearProgress, Pagination, Tooltip,
  Grid, Alert,
} from '@mui/material';
import { Add, Search, Edit, Visibility, Inventory2, Refresh, Warning } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

export const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['parts', search, page],
    queryFn: () => apiService.get(`/inventory?search=${search}&page=${page}&limit=15`).then(r => r.data),
  });

  const parts = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const total = data?.meta?.total || 0;
  const alertsCount = parts.filter((part: any) => part.currentStock <= part.minStockLevel).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>إدارة المخزون</Typography>
          <Typography variant="body2" color="text.secondary">إجمالي القطع: {total}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="تحديث"><IconButton onClick={() => refetch()}><Refresh /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<Add />}>إضافة قطعة</Button>
        </Box>
      </Box>

      {alertsCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
          يوجد {alertsCount} قطعة تحتاج إعادة طلب
        </Alert>
      )}

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <TextField
            size="small" placeholder="بحث باسم القطعة أو رقمها..."
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
                <TableCell sx={{ fontWeight: 700 }}>رقم القطعة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الاسم</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>التصنيف</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>المخزون الحالي</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحد الأدنى</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>سعر البيع</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parts.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Inventory2 sx={{ fontSize: 48, color: 'grey.300' }} />
                    <Typography color="text.secondary">لا توجد قطع في المخزون</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                parts.map((part: any) => (
                  <TableRow key={part.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600} color="primary">{part.partNumber}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{part.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{part.brand}</Typography>
                    </TableCell>
                    <TableCell>{part.category?.name || '—'}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2" fontWeight={700}
                        color={part.currentStock <= part.minStockLevel ? 'error.main' : 'text.primary'}
                      >
                        {part.currentStock}
                      </Typography>
                    </TableCell>
                    <TableCell>{part.minStockLevel}</TableCell>
                    <TableCell>{part.sellingPrice?.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <Chip
                        label={part.currentStock === 0 ? 'نفد' : part.currentStock <= part.minStockLevel ? 'منخفض' : 'متوفر'}
                        color={part.currentStock === 0 ? 'error' : part.currentStock <= part.minStockLevel ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="عرض"><IconButton size="small"><Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="تعديل"><IconButton size="small" color="primary"><Edit fontSize="small" /></IconButton></Tooltip>
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
