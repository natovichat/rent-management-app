import type { Metadata } from 'next';
import OwnerPaymentsPage from '@/components/owner-payments/OwnerPaymentsPage';

export const metadata: Metadata = {
  title: 'תשלומים לבעלים | מערכת ניהול נכסים',
  description: 'מעקב תשלומי שכירות לבעלים לפי אחוזי בעלות',
};

export default function Page() {
  return <OwnerPaymentsPage />;
}
