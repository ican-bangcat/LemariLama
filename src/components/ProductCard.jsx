import { motion } from "framer-motion";

const ProductCard = ({ car }) => {
    return (
        <div className="bg-white rounded-xl p-4 shadow-md flex flex-col gap-2 hover:scale-[1.02] transition-all duration-300">
            <img
                src={car.image}
                alt={car.name}
                className="h-32 object-contain mx-auto"
            />

            <h2 className="font-semibold text-center">{car.name}</h2>

            <div className="text-sm text-gray-500 text-center">
                {car.fuel && `${car.fuel} • `}{car.transmission && `${car.transmission} • `}{car.seats ? `${car.seats} seats` : ""}
            </div>

            <div className="font-bold text-lg text-center text-black">
                Rp {car.price}
            </div>

            {/* Tombol Edit animasi */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="mt-auto bg-white border border-black text-black hover:bg-black hover:text-white px-4 py-2 rounded-md transition-colors"
            >
                Edit
            </motion.button>
        </div>
    );
};

export default ProductCard;
