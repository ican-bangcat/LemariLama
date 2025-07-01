import { MdDashboardCustomize } from "react-icons/md"; 
import { SiSalesforce } from "react-icons/si";
import { AiOutlineMessage } from "react-icons/ai";
import { AiFillCustomerService } from "react-icons/ai";
import { AiOutlineFundView } from "react-icons/ai";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="w-60 h-screen bg-white shadow-md p-5 flex flex-col gap-6">
            <div className="p-8 flex items-center justify-center">
                <img
                    src="/images/logo.png"
                    alt="Logo Carryon"
                    className="h-25 w-auto object-contain"
                />
            </div>
            <div className="border-t border-gray-300"></div>
            <div className="flex flex-col gap-2 ">
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isActive
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
                        `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isActive
                            ? "bg-black text-white"
                            : "bg-white text-black hover:bg-gray-200"
                        }`
                    }
                >
                    <AiOutlineFundView className="text-lg" />
                    Product
                </NavLink>

                <NavLink
                    to="/admin/customer"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isActive
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
                        `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isActive
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
                        `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isActive
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
    );
};

export default Sidebar;
