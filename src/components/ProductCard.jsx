import { motion } from "framer-motion";

const ProductCard = ({ car }) => {
    return (
        <div className="bg-white rounded-xl p-4 shadow-md flex flex-col gap-2 hover:scale-105 transition-all duration-300">
            <img src={car.image} alt={car.name} className="h-32 object-contain" />
            <h2 className="font-semibold">{car.name}</h2>
            <div className="text-sm text-gray-500">
                {car.fuel} • {car.transmission} • {car.seats} seats
            </div>
            <div className="font-bold text-lg">${car.price}</div>

            {/* Animated Button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="mt-auto bg-black text-black px-4 py-2 rounded-md"
            >
                Edit
            </motion.button>
        </div>
    );
};

export default ProductCard;
