import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

const dummyData = [
  {
    name: "Toyota GT 86",
    image: "/images/gt86.png",
    fuel: "80L",
    transmission: "Manual",
    seats: 2,
    price: "37.612",
  },
  {
    name: "Palisade type G",
    image: "/images/palisade.png",
    fuel: "80L",
    transmission: "Manual",
    seats: 2,
    price: "37.612",
  },
  {
    name: "Laptop MacBook Pro 2019",
    image: "/images/macbook.png",
    transmission: "SSD 256GB",
    price: "12.500.000",
  },
  {
    name: "Kamera Canon EOS 80D",
    image: "/images/canon.png",
    transmission: "Lensa 18-135mm",
    price: "6.800.000",
  },
  {
    name: "Sepatu Nike Air Jordan",
    image: "/images/nike.png",
    transmission: "Size 42",
    price: "2.350.000",
  },
  {
    name: "HP Samsung S21 5G",
    image: "/images/samsung.png",
    transmission: "128GB",
    price: "4.500.000",
  },
];

const AdminDashboard = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold">Product</h1>
          <p className="text-gray-500 mb-4">
            Manage your product inventory, ensuring all listings are up-to-date and accurate
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyData.map((car, i) => (
              <ProductCard key={i} car={car} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;
