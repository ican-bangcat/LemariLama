import { IoMdNotificationsOutline } from "react-icons/io"; 
import { FiSearch } from "react-icons/fi"; 



const Topbar = () => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      {/* Search Input */}
      <div className="relative w-1/2">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <FiSearch />
        </span>
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-4"><IoMdNotificationsOutline />
        <span className="text-gray-700 font-medium">George Nico</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </div>
  );
};

export default Topbar;
