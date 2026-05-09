import React, { useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, Divider, Chip } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode.react';

interface BookingPrintProps {
  booking: any;
  garage: any;
  customer: any;
  vehicle: any;
  service: any;
}

export const BookingPrint: React.FC<BookingPrintProps> = ({
  booking,
  garage,
  customer,
  vehicle,
  service,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const qrData = JSON.stringify({
    bookingId: booking.id,
    vehiclePlate: vehicle.plate,
    customerName: customer.fullName,
  });

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handlePrint} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          طباعة الورقة
        </button>
      </Box>

      <div ref={printRef} style={{ padding: '20px', background: 'white' }}>
        <Card sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
          <CardContent>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight={700} mb={1}>
                {garage?.name || 'الكراج'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {garage?.address} | {garage?.phone}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Booking Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 1 }}>
                معلومات الحجز
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">رقم الحجز:</Typography>
                  <Typography variant="body1" fontWeight={600}>{booking.id.slice(0, 8)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">التاريخ:</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(booking.scheduledAt).toLocaleDateString('ar-SA')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">الوقت:</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(booking.scheduledAt).toLocaleTimeString('ar-SA')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">الحالة:</Typography>
                  <Chip label={booking.status} color="primary" size="small" />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Customer Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ bgcolor: 'secondary.light', p: 1, borderRadius: 1 }}>
                معلومات العميل
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">الاسم:</Typography>
                  <Typography variant="body1" fontWeight={600}>{customer?.fullName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">الهاتف:</Typography>
                  <Typography variant="body1" fontWeight={600}>{customer?.phone}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">البريد:</Typography>
                  <Typography variant="body1" fontWeight={600}>{customer?.email}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Vehicle Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ bgcolor: 'success.light', p: 1, borderRadius: 1 }}>
                معلومات السيارة
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">الشركة:</Typography>
                  <Typography variant="body1" fontWeight={600}>{vehicle?.make}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">الموديل:</Typography>
                  <Typography variant="body1" fontWeight={600}>{vehicle?.model}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">رقم اللوحة:</Typography>
                  <Typography variant="body1" fontWeight={600}>{vehicle?.plate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">السنة:</Typography>
                  <Typography variant="body1" fontWeight={600}>{vehicle?.year}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Service Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ bgcolor: 'warning.light', p: 1, borderRadius: 1 }}>
                الخدمة المطلوبة
              </Typography>
              <Typography variant="body1" fontWeight={600} mb={1}>
                {service?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                السعر: {service?.price} ر.س
              </Typography>
            </Box>

            {booking.issues && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2} sx={{ bgcolor: 'error.light', p: 1, borderRadius: 1 }}>
                    الأعطال الموجودة
                  </Typography>
                  <Typography variant="body1">{booking.issues}</Typography>
                </Box>
              </>
            )}

            {booking.notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2} sx={{ bgcolor: 'info.light', p: 1, borderRadius: 1 }}>
                    ملاحظات إضافية
                  </Typography>
                  <Typography variant="body1">{booking.notes}</Typography>
                </Box>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* QR Code */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                امسح الرمز لمتابعة حالة سيارتك
              </Typography>
              <Box sx={{ display: 'inline-block', p: 2, border: '2px solid #000', borderRadius: 2 }}>
                <QRCode value={qrData} size={150} level="H" />
              </Box>
              <Typography variant="caption" display="block" mt={2} color="text.secondary">
                يمكنك مسح هذا الرمز لمعرفة حالة سيارتك لحظة بلحظة
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                شكراً لثقتكم بنا - {garage?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date().toLocaleDateString('ar-SA')} | {new Date().toLocaleTimeString('ar-SA')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};
