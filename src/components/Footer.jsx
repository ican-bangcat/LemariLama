const Footer = () => {
  return (
    <footer className="bg-white shadow-inner py-4 px-6 mt-auto">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>&copy; {new Date().getFullYear()} Carryon | All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
