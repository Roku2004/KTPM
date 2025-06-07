import Link from 'next/link';

const HomeScreen = () => {
    return (
        <>
            <div className="py-12 bg-light mb-8">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-2">Welcome to BlueMoon Apartment</h1>
                    <p className="text-lg text-gray-600 mb-4">
                        Comprehensive fee management system for apartment residents and administration
                    </p>
                    <Link href="/login" legacyBehavior>
                        <a>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow mx-2">
                                Sign In
                            </button>
                        </a>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="shadow rounded-lg bg-white">
                    <div className="p-6">
                        <div className="flex items-center mb-2">
                            <i className="fas fa-home text-primary text-2xl mr-2"></i>
                            <span className="text-xl font-semibold">Household Management</span>
                        </div>
                        <p className="text-gray-600">
                            Easily manage apartment households, track residents and maintain accurate records of all occupants.
                        </p>
                    </div>
                </div>
                <div className="shadow rounded-lg bg-white">
                    <div className="p-6">
                        <div className="flex items-center mb-2">
                            <i className="fas fa-file-invoice-dollar text-success text-2xl mr-2"></i>
                            <span className="text-xl font-semibold">Fee Collection</span>
                        </div>
                        <p className="text-gray-600">
                            Streamline the process of managing apartment fees, utilities, and other charges with our intuitive system.
                        </p>
                    </div>
                </div>
                <div className="shadow rounded-lg bg-white">
                    <div className="p-6">
                        <div className="flex items-center mb-2">
                            <i className="fas fa-chart-line text-info text-2xl mr-2"></i>
                            <span className="text-xl font-semibold">Reports & Analytics</span>
                        </div>
                        <p className="text-gray-600">
                            Generate detailed reports on payment status, resident statistics, and financial summaries.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="shadow rounded-lg bg-white">
                    <div className="p-6">
                        <div className="flex items-center mb-2">
                            <i className="fas fa-users text-warning text-2xl mr-2"></i>
                            <span className="text-xl font-semibold">Resident Information</span>
                        </div>
                        <p className="text-gray-600">
                            Maintain comprehensive resident profiles including contact information, documentation, and residence status.
                        </p>
                    </div>
                </div>
                <div className="shadow rounded-lg bg-white">
                    <div className="p-6">
                        <div className="flex items-center mb-2">
                            <i className="fas fa-lock text-danger text-2xl mr-2"></i>
                            <span className="text-xl font-semibold">Secure & Reliable</span>
                        </div>
                        <p className="text-gray-600">
                            Our system ensures data security and provides reliable access to important apartment management information.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomeScreen; 