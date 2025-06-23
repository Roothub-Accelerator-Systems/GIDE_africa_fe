import { motion } from 'framer-motion';

const LogoutConfirmation = ({ onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onConfirm(false)}
      ></div>

      {/* Modal */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 z-10 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to log out of your account?
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={() => onConfirm(false)}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700
                       dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;