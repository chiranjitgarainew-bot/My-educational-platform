import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, QrCode, Smartphone, CheckCircle, Copy, AlertCircle, Clock } from 'lucide-react';
import { getBatchById } from '../data';
import { userDb } from '../services/db';
import { User, EnrollmentRequest } from '../types';

const Payment: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  const batch = getBatchById(batchId);
  
  // State for Payment
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [paymentTab, setPaymentTab] = useState<'qr' | 'phonepe'>('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  useEffect(() => {
    const sessionUser = userDb.getSession();
    if (!sessionUser) {
      navigate('/');
      return;
    }
    setUser(sessionUser);
  }, []);

  if (!batch || !user) return <div className="p-10 text-center">Loading...</div>;

  const finalPrice = Math.max(0, batch.price - discount);
  const upiId = "9732140742@ybl";
  
  // Create UPI Intent Link
  const upiLink = `upi://pay?pa=${upiId}&pn=BongMistry&am=${finalPrice}&cu=INR&tn=Payment for ${batch.name}`;
  
  // QR Code Image API (using qrserver for demo)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    
    // Mock Coupon Logic
    if (couponCode.toUpperCase() === 'SPECIAL500') {
      setDiscount(500);
      setCouponSuccess('Coupon Applied! ₹500 Saved.');
    } else if (couponCode.toUpperCase() === 'BONG20') {
      setDiscount(Math.round(batch.price * 0.2));
      setCouponSuccess('20% Discount Applied!');
    } else {
      setCouponError('Invalid Coupon Code');
      setDiscount(0);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    
    // Create Enrollment Request
    const request: EnrollmentRequest = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        batchId: batch.id,
        batchName: batch.batchName,
        amount: finalPrice,
        timestamp: Date.now(),
        status: 'pending'
    };

    await userDb.createEnrollmentRequest(request);
    
    setTimeout(() => {
        setIsProcessing(false);
        setIsRequestSent(true);
    }, 1500);
  };

  if (isRequestSent) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
              <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                      <Clock size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Pending</h2>
                  <p className="text-gray-500 mb-6">
                      We have received your payment request for <span className="font-bold">{batch.batchName}</span>. 
                      Admins will verify your payment and approve access shortly (usually within 1 hour).
                  </p>
                  <button 
                      onClick={() => navigate('/classes')}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-blue-600"
                  >
                      Back to Classes
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-gray-800">Secure Payment</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        
        {/* Order Summary */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wide">Order Summary</h3>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-800 font-medium">{batch.batchName}</span>
            <span className="text-gray-800">₹{batch.price}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-green-600 text-sm">
              <span>Coupon Discount</span>
              <span>- ₹{discount}</span>
            </div>
          )}
          <div className="border-t border-gray-100 my-3"></div>
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total Payable</span>
            <span>₹{finalPrice}</span>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="text-primary" size={20} />
            <h3 className="font-bold text-gray-800">Apply Coupon</h3>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter Code (e.g. SPECIAL500)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 uppercase focus:ring-2 focus:ring-primary outline-none"
            />
            <button 
              onClick={handleApplyCoupon}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black transition"
            >
              Apply
            </button>
          </div>
          {couponError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {couponError}</p>}
          {couponSuccess && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12}/> {couponSuccess}</p>}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setPaymentTab('qr')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${paymentTab === 'qr' ? 'bg-blue-50 text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                >
                    <QrCode size={18} /> Scan QR
                </button>
                <button 
                    onClick={() => setPaymentTab('phonepe')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${paymentTab === 'phonepe' ? 'bg-blue-50 text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                >
                    <Smartphone size={18} /> PhonePe / UPI
                </button>
            </div>

            <div className="p-6">
                {paymentTab === 'qr' ? (
                    <div className="flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-4 text-center">Scan this QR code with any UPI app (PhonePe, GPay, Paytm)</p>
                        <div className="border-4 border-gray-900 rounded-xl p-2 mb-4">
                            <img src={qrCodeUrl} alt="Payment QR" className="w-48 h-48" />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded text-sm text-gray-600 mb-4">
                            <span>{upiId}</span>
                            <Copy size={14} className="cursor-pointer hover:text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-red-500 mb-2 font-medium">Do not close this page after payment!</p>
                            <button 
                                onClick={handlePaymentSuccess}
                                disabled={isProcessing}
                                className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-700 w-full animate-pulse"
                            >
                                {isProcessing ? 'Verifying...' : 'I Have Paid'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Pay via PhonePe</h3>
                        <p className="text-gray-500 text-sm mb-6">Click the button below to open PhonePe or your default UPI app securely.</p>
                        
                        <a 
                            href={upiLink}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full bg-[#5f259f] text-white py-3 rounded-xl font-bold text-lg shadow-md hover:opacity-90 transition mb-4"
                        >
                            Continue with PhonePe
                        </a>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">After Payment</span></div>
                        </div>

                        <button 
                            onClick={handlePaymentSuccess}
                            disabled={isProcessing}
                            className="w-full bg-white border-2 border-green-500 text-green-600 py-2.5 rounded-xl font-bold hover:bg-green-50 transition"
                        >
                            {isProcessing ? 'Verifying...' : 'Click Here if Payment Done'}
                        </button>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;