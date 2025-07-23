import { MdDashboardCustomize } from "react-icons/md";
import { SiSalesforce } from "react-icons/si";
import { AiOutlineMessage, AiOutlineFundView } from "react-icons/ai";
import { AiFillCustomerService } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../pages/contexts/AuthContext";

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            //   await logout();       // Panggil fungsi logout dari context

            navigate("/");        // Arahkan ke halaman publik setelah logout
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="w-60 h-screen bg-white shadow-md p-5 flex flex-col justify-between">
            <div>
                <div className="p-8 flex items-center justify-center">
                    <img
                        src="/images/logo.png"
                        alt="Logo Carryon"
                        className="h-25 w-auto object-contain"
                    />
                </div>
                <div className="border-t border-gray-300"></div>
                <div className="flex flex-col gap-2 mt-4">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-start gap-2 ${isActive
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-gray-200"
                            }`
                        }
                    >
                        <MdDashboardCustomize className="text-lg" />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/product"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-start gap-2 ${isActive
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-gray-200"
                            }`
                        }
                    >
                        <AiOutlineFundView className="text-lg" />
                        Product
                    </NavLink>
                    <NavLink
                        to="/admin/testimonials"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-start gap-2 ${isActive
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-gray-200"
                            }`
                        }
                    >
                        <AiOutlineFundView className="text-lg" />
                        Testimonial
                    </NavLink>
                    <NavLink
                        to="/admin/customer"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-start gap-2 ${isActive
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-gray-200"
                            }`
                        }
                    >
                        <AiFillCustomerService className="text-lg" />
                        Customer
                    </NavLink>
                    <NavLink
                        to="/admin/order"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-start gap-2 ${isActive
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-gray-200"
                            }`
                        }
                    >
                        <AiOutlineMessage className="text-lg" />
                        Manage Pesanan
                    </NavLink>
                    <NavLink
                        to="/admin/history"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-start gap-2 ${isActive
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-gray-200"
                            }`
                        }
                    >
                        <SiSalesforce className="text-lg" />
                        History
                    </NavLink>
                </div>
            </div>
            <div className="mt-8">
                <button
                    onClick={handleLogout}
                    className="group w-full px-4 py-2 rounded-lg font-medium flex items-center justify-start gap-2 text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    <FiLogOut className="text-lg group-hover:rotate-[-10deg] transition-transform duration-200" />
                    Keluar
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
