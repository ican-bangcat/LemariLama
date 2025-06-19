import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

const customerData = [
    {
        id: 1,
        name: "Rani Oktaviani",
        email: "rani@email.com",
        phone: "08123456789",
    },
    {
        id: 2,
        name: "Dian Pratama",
        email: "dian@email.com",
        phone: "08213456789",
    },
    {
        id: 3,
        name: "Fajar Nugroho",
        email: "fajar@email.com",
        phone: "08313456789",
    },
    {
        id: 4,
        name: "Siti Marlina",
        email: "siti@email.com",
        phone: "08999999999",
    },
    {
        id: 5,
        name: "Yoga Prasetyo",
        email: "yoga@email.com",
        phone: "08777777777",
    },
    {
        id: 6,
        name: "Nia Rahmadani",
        email: "nia@email.com",
        phone: "08555555555",
    },
    {
        id: 7,
        name: "Tegar Hidayat",
        email: "tegar@email.com",
        phone: "08128888888",
    },
    {
        id: 8,
        name: "Vina Safitri",
        email: "vina@email.com",
        phone: "08332221111",
    },
    {
        id: 9,
        name: "Zulfikar Maulana",
        email: "zulfi@email.com",
        phone: "08214445555",
    },
    {
        id: 10,
        name: "Dewi Kusuma",
        email: "dewi@email.com",
        phone: "08782312345",
    },
    {
        id: 11,
        name: "Rizky Ramadhan",
        email: "rizky@email.com",
        phone: "08129995555",
    },
    {
        id: 12,
        name: "Ayu Lestari",
        email: "ayu@email.com",
        phone: "08981234567",
    },
];

const CustomerPage = () => {
    const handleShowInfo = (customer) => {
        alert(`Nama: ${customer.name}\nEmail: ${customer.email}\nTelp: ${customer.phone}`);
    };

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
                <Topbar />

                <div className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-bold mb-4">Data Customer LemariLama</h1>

                    <table className="min-w-full bg-white shadow rounded-md">
                        <thead>
                            <tr className="bg-gray-200 text-left text-sm uppercase font-medium text-gray-600">
                                <th className="px-6 py-3">Nama</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">No. Telp</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerData.map((cust) => (
                                <tr key={cust.id} className="border-t text-sm">
                                    <td className="px-6 py-4">{cust.name}</td>
                                    <td className="px-6 py-4">{cust.email}</td>
                                    <td className="px-6 py-4">{cust.phone}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleShowInfo(cust)}
                                            className="bg-black text-black px-3 py-1  hover:scale-105 transition"
                                        >
                                            Lihat Info
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default CustomerPage;
