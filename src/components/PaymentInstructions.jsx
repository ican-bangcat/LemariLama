import React from 'react';
import { Copy, CreditCard, Smartphone, Truck } from 'lucide-react';

const PaymentInstructions = ({ order }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
    alert('Nomor rekening disalin!');
  };

  const paymentMethods = {
    bank_transfer: {
      title: 'Transfer Bank',
      icon: <CreditCard className="w-6 h-6" />,
      accounts: [
        { bank: 'BCA', number: '1234567890', name: 'Lemari Lama' },
        { bank: 'Mandiri', number: '9876543210', name: 'Lemari Lama' },
        { bank: 'BNI', number: '0987654321', name: 'Lemari Lama' },
        { bank: 'BRI', number: '1357924680', name: 'Lemari Lama' }
      ]
    },
    e_wallet: {
      title: 'E-Wallet',
      icon: <Smartphone className="w-6 h-6" />,
      accounts: [
        { provider: 'GoPay', number: '0895621336473', name: 'Lemari Lama' },
        { provider: 'OVO', number: '0895621336473', name: 'Lemari Lama' },
        { provider: 'DANA', number: '0895621336473', name: 'Lemari Lama' },
        { provider: 'ShopeePay', number: '0895621336473', name: 'Lemari Lama' }
      ]
    },
    cod: {
      title: 'Bayar di Tempat (COD)',
      icon: <Truck className="w-6 h-6" />,
      description: 'Bayar saat produk diterima'
    }
  };

  const selectedMethod = paymentMethods[order.payment_method];

  if (!selectedMethod) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Metode pembayaran tidak valid</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          {selectedMethod.icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Instruksi Pembayaran
          </h3>
          <p className="text-gray-600">{selectedMethod.title}</p>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">Nomor Pesanan:</span>
          <span className="font-mono text-blue-600">{order.order_number}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total Pembayaran:</span>
          <span className="text-2xl font-bold text-green-600">
            {formatPrice(order.total_amount)}
          </span>
        </div>
      </div>

      {/* Bank Transfer Instructions */}
      {order.payment_method === 'bank_transfer' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Pilih Bank Tujuan Transfer:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMethod.accounts.map((account, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <img 
                        src={`https://placehold.co/32x20/E2E8F0/4A5568?text=${account.bank}`}
                        alt={account.bank}
                        className="w-8 h-5 object-contain"
                      />
                      <span className="font-semibold text-gray-900">{account.bank}</span>
                    </div>
                    <p className="text-lg font-mono font-semibold text-gray-800 mb-1">
                      {account.number}
                    </p>
                    <p className="text-sm text-gray-600">a.n. {account.name}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(account.number)}
                    className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Salin nomor rekening"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Salin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E-Wallet Instructions */}
      {order.payment_method === 'e_wallet' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Pilih E-Wallet:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMethod.accounts.map((account, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {account.provider.charAt(0)}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">{account.provider}</span>
                    </div>
                    <p className="text-lg font-mono font-semibold text-gray-800 mb-1">
                      {account.number}
                    </p>
                    <p className="text-sm text-gray-600">a.n. {account.name}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(account.number)}
                    className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Salin nomor"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Salin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COD Instructions */}
      {order.payment_method === 'cod' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Truck className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Cash on Delivery (COD)</h4>
              <p className="text-yellow-700 mb-2">
                Anda akan membayar saat produk tiba di alamat tujuan.
              </p>
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">
                  <strong>Yang perlu dipersiapkan:</strong>
                </p>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• Uang tunai sejumlah <strong>{formatPrice(order.total_amount)}</strong></li>
                  <li>• Pastikan ada yang menerima di alamat tujuan</li>
                  <li>• Periksa produk sebelum melakukan pembayaran</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Steps */}
      {(order.payment_method === 'bank_transfer' || order.payment_method === 'e_wallet') && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Langkah Konfirmasi Pembayaran:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Lakukan pembayaran sesuai dengan total pesanan</li>
            <li>Simpan bukti pembayaran (screenshot/foto struk)</li>
            <li>
              Upload bukti pembayaran melalui halaman{' '}
              <button 
                onClick={() => window.location.href = '/orders'}
                className="underline hover:text-blue-900"
              >
                "Pesanan Saya"
              </button>
            </li>
            <li>Tunggu konfirmasi dari admin (maksimal 1x24 jam)</li>
            <li>Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
          </ol>
          
          <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>Catatan Penting:</strong> Pastikan nominal transfer sama persis dengan total pesanan.
              Jika ada selisih, silakan hubungi customer service kami.
            </p>
          </div>
        </div>
      )}

      {/* Customer Service Contact */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Butuh Bantuan?</h4>
        <p className="text-sm text-gray-600 mb-2">
          Jika ada kendala atau pertanyaan, hubungi customer service kami:
        </p>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <a 
            href="https://wa.me/0895621336473"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-green-600 hover:text-green-700"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">WhatsApp: 0895621336473</span>
          </a>
          <a 
            href="mailto:support@lemarilama.com"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <span className="text-sm">Email: support@lemarilama.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;