import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton,
  TextField, InputAdornment, LinearProgress, Pagination, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from '@mui/material';
import { Add, Search, Visibility, Assignment, Refresh, Timer } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوح', IN_PROGRESS: 'قيد العمل',
  ON_HOLD: 'معلق', COMPLETED: 'مكتمل', CLOSED: 'مغلق',
};
const STATUS_COLORS: Record<string, any> = {
  OPEN: 'default', IN_PROGRESS: 'primary',
  ON_HOLD: 'warning', COMPLETED: 'success', CLOSED: 'secondary',
};

export const JobCards: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['job-cards', search, page],
    queryFn: () => apiService.get(`/job-cards?search=${search}&page=${page}&limit=15`).then(r => r.data),
  });

  const jobCards = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>بطاقات العمل</Typography>
          <Typography variant="body2" color="text.secondary">إجمالي: {total}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="تحديث"><IconButton onClick={() => refetch()}><Refresh /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/job-cards/new')}>
            بطاقة جديدة
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <TextField
            size="small" placeholder="بحث برقم البطاقة أو العميل..."
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
                <TableCell sx={{ fontWeight: 700 }}>رقم البطاقة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>السيارة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الفني</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>التكلفة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobCards.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Assignment sx={{ fontSize: 48, color: 'grey.300' }} />
                    <Typography color="text.secondary">لا توجد بطاقات عمل</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                jobCards.map((card: any) => (
                  <TableRow key={card.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary">
                        {card.jobNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{card.booking?.customer?.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{card.booking?.customer?.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      {card.vehicle?.make} {card.vehicle?.model}
                      <Typography variant="caption" color="text.secondary" display="block">{card.vehicle?.plate}</Typography>
                    </TableCell>
                    <TableCell>
                      {card.technician ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                            {card.technician?.user?.fullName?.[0]}
                          </Avatar>
                          <Typography variant="body2">{card.technician?.user?.fullName}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">غير معين</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {card.actualCost?.toLocaleString() || '—'} ر.س
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABELS[card.status] || card.status}
                        color={STATUS_COLORS[card.status]} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="عرض التفاصيل">
                        <IconButton size="small" onClick={() => navigate(`/job-cards/${card.id}`)}>
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
            <Pagination count={totalPages} page={page}
              onChange={(_: any, v: number) => setPage(v)} color="primary" />
          </Box>
        )}
      </Card>
    </Box>
  );
};
