
interface TeacherPaymentConfig {
  teacherId: string;
  paymentMethod: 'stripe' | 'paypal' | 'payoneer';
  accountId: string;
  price: number;
  currency: string;
}

interface CreatePaymentRequest {
  teacherId: string;
  studentEmail: string;
  studentName?: string;
  date: string;
  timeSlot: { start: string; end: string };
  amount: number;
}

export class PaymentService {
  private static async getTeacherPaymentConfig(teacherId: string): Promise<TeacherPaymentConfig> {
    // In a real implementation, this would fetch from your secure backend
    // The backend would verify the teacher's authenticated session and return their payment config
    const response = await fetch(`/api/teachers/${teacherId}/payment-config`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get teacher payment configuration');
    }
    
    return response.json();
  }

  static async createSecurePayment(request: CreatePaymentRequest): Promise<{ paymentUrl: string }> {
    try {
      // Get teacher's payment configuration securely from backend
      const teacherConfig = await this.getTeacherPaymentConfig(request.teacherId);
      
      // Verify that the amount matches the teacher's configured price
      if (request.amount !== teacherConfig.price) {
        throw new Error('Payment amount does not match teacher\'s price');
      }

      // Create payment through secure backend endpoint
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          ...request,
          teacherAccountId: teacherConfig.accountId,
          paymentMethod: teacherConfig.paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating secure payment:', error);
      throw error;
    }
  }

  static async verifyPayment(paymentId: string, teacherId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ teacherId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }
}
