'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { qrSessionService, QRSessionData } from '@/lib/qr-session';
import {
  Clock,
  Car,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  User,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface Props {
  qrToken: string;
}

export default function QRSessionClient({ qrToken }: Props) {
  const router = useRouter();

  const [data, setData] = useState<QRSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const sessionData = await qrSessionService.getQRSession(qrToken);
      setData(sessionData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching QR session:', err);
      if (err.response?.status === 404) {
        setError('QR Code غير صالح - الحجز غير موجود');
      } else if (err.response?.status === 400) {
        setError('QR Code منتهي الصلاحية');
      } else {
        setError('حدث خطأ أثناء تحميل البيانات');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (qrToken) {
      fetchData();
    }
  }, [qrToken]);

  const handleApprove = async (serviceId: string) => {
    try {
      await qrSessionService.approveAdditionalService(qrToken, serviceId);
      await fetchData();
    } catch {
      alert('فشلت الموافقة على الخدمة');
    }
  };

  const handleReject = async (serviceId: string) => {
    try {
      await qrSessionService.rejectAdditionalService(qrToken, serviceId);
      await fetchData();
    } catch {
      alert('فشل رفض الخدمة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">حدث خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
      SENT: 'bg-blue-100 text-blue-800 border-blue-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      OVERDUE: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'قيد الانتظار',
      CONFIRMED: 'مؤكد',
      IN_PROGRESS: 'جاري العمل',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي',
      DRAFT: 'مسودة',
      SENT: 'مرسل',
      PAID: 'مدفوع',
      OVERDUE: 'متأخر',
    };
    return texts[status] || status;
  };

  const latestInvoice = data.invoices[0];
  const latestHandover = data.mechanicHandovers[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">نظام إدارة الكراج</h1>
              <p className="text-xs text-gray-500">حجز #{data.id.slice(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="تحديث"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">حالة الحجز</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(data.status)}`}>
              {getStatusText(data.status)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm">
                {new Date(data.scheduledAt).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm">
                {new Date(data.scheduledAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            بيانات السيارة
          </h2>
          <div className="space-y-3">
            {[
              { label: 'الشركة', value: data.vehicle.make },
              { label: 'الموديل', value: `${data.vehicle.model} ${data.vehicle.year}` },
              { label: 'رقم اللوحة', value: data.vehicle.plate },
              ...(data.vehicle.vin ? [{ label: 'رقم الشاسيه', value: data.vehicle.vin }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">{label}</span>
                <span className="font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            الخدمة المطلوبة
          </h2>
          {data.service ? (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{data.service.name}</h3>
              {data.service.description && <p className="text-gray-600 text-sm mb-3">{data.service.description}</p>}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">السعر المقدر</span>
                <span className="font-bold text-2xl text-blue-600">
                  {data.service.price.toLocaleString('ar-SA')} {data.invoices[0]?.currency || 'SAR'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">لا توجد خدمة محددة</p>
          )}
        </div>

        {/* Additional Services */}
        {data.additionalServices.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              الخدمات الإضافية
            </h2>
            <div className="space-y-3">
              {data.additionalServices.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 rounded-xl border ${service.approved ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.approved ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {service.approved ? 'تمت الموافقة' : 'بانتظار الموافقة'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">السعر</span>
                    <span className="font-semibold text-gray-900">
                      {service.price.toLocaleString('ar-SA')} {data.invoices[0]?.currency || 'SAR'}
                    </span>
                  </div>
                  {!service.approved && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(service.id)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> موافقة
                      </button>
                      <button
                        onClick={() => handleReject(service.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> رفض
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handover */}
        {latestHandover && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-600" />
              معلومات الفني
            </h2>
            <div className="space-y-3">
              {latestHandover.fromMechanic && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                  <span className="text-gray-600">من الفني</span>
                  <span className="font-semibold text-gray-900">{latestHandover.fromMechanic.fullName}</span>
                </div>
              )}
              {latestHandover.toMechanic && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                  <span className="text-gray-600">إلى الفني</span>
                  <span className="font-semibold text-gray-900">{latestHandover.toMechanic.fullName}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="text-gray-600">وقت التسليم</span>
                <span className="font-semibold text-gray-900">{new Date(latestHandover.handoverTime).toLocaleString('ar-SA')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="text-gray-600">الحالة</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(latestHandover.status)}`}>
                  {getStatusText(latestHandover.status)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Invoice */}
        {latestInvoice && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              الفاتورة
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">رقم الفاتورة</span>
                <span className="font-semibold text-gray-900">{latestInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">الحالة</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(latestInvoice.status)}`}>
                  {getStatusText(latestInvoice.status)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-semibold text-gray-900">{latestInvoice.subtotal.toLocaleString('ar-SA')} {latestInvoice.currency}</span>
              </div>
              {latestInvoice.discountAmount > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="text-gray-600">الخصم</span>
                  <span className="font-semibold text-green-600">-{latestInvoice.discountAmount.toLocaleString('ar-SA')} {latestInvoice.currency}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">الضريبة</span>
                <span className="font-semibold text-gray-900">{latestInvoice.taxAmount.toLocaleString('ar-SA')} {latestInvoice.currency}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <span className="text-gray-900 font-bold text-lg">الإجمالي</span>
                <span className="font-bold text-2xl text-green-600">{latestInvoice.totalAmount.toLocaleString('ar-SA')} {latestInvoice.currency}</span>
              </div>
              {latestInvoice.status === 'SENT' && (
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" /> دفع الآن
                </button>
              )}
            </div>
          </div>
        )}

        {/* Garage Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-red-600" />
            معلومات الكراج
          </h2>
          <div className="space-y-3">
            {[
              { label: 'الاسم', value: data.garage.name },
              { label: 'العنوان', value: data.garage.address },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">{label}</span>
                <span className="font-semibold text-gray-900 text-right">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">الهاتف</span>
              <a href={`tel:${data.garage.phone}`} className="font-semibold text-blue-600 hover:text-blue-700">
                {data.garage.phone}
              </a>
            </div>
          </div>
        </div>

        {data.notes && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ملاحظات</h2>
            <p className="text-gray-600">{data.notes}</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© 2025 نظام إدارة الكراج. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
