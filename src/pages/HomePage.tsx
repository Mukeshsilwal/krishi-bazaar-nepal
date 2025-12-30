import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">🌾</span>
                            <h1 className="text-2xl font-bold text-green-600">KrishiHub Nepal</h1>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-5xl font-bold text-gray-900 mb-6">
                        Direct Connection Between
                        <span className="text-green-600"> Farmers </span>
                        and
                        <span className="text-blue-600"> Buyers</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        KrishiHub Nepal brings farmers and buyers together on a single platform,
                        eliminating middlemen and ensuring fair prices for everyone.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/marketplace"
                            className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition shadow-lg"
                        >
                            Browse Marketplace
                        </Link>
                        <Link
                            to="/register"
                            className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Why Choose KrishiHub?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
                        <div className="text-5xl mb-4">👨‍🌾</div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">For Farmers</h4>
                        <ul className="text-gray-600 space-y-2">
                            <li>✓ Sell directly to buyers</li>
                            <li>✓ Set your own prices</li>
                            <li>✓ No middleman commission</li>
                            <li>✓ Secure payments</li>
                        </ul>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
                        <div className="text-5xl mb-4">🛒</div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">For Buyers</h4>
                        <ul className="text-gray-600 space-y-2">
                            <li>✓ Fresh produce directly from farms</li>
                            <li>✓ Fair and transparent pricing</li>
                            <li>✓ Quality guaranteed</li>
                            <li>✓ Easy ordering process</li>
                        </ul>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
                        <div className="text-5xl mb-4">💰</div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h4>
                        <ul className="text-gray-600 space-y-2">
                            <li>✓ eSewa integration</li>
                            <li>✓ Khalti support</li>
                            <li>✓ Escrow protection</li>
                            <li>✓ Transaction tracking</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        How It Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">1</span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Register</h4>
                            <p className="text-gray-600">Create your account as a farmer or buyer</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">2</span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Browse/List</h4>
                            <p className="text-gray-600">Farmers list crops, buyers browse marketplace</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">3</span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Order & Pay</h4>
                            <p className="text-gray-600">Place orders and make secure payments</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">4</span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Pickup</h4>
                            <p className="text-gray-600">Coordinate pickup and complete transaction</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-3xl font-bold text-white mb-4">
                        Ready to Get Started?
                    </h3>
                    <p className="text-xl text-white mb-8">
                        Join thousands of farmers and buyers already using KrishiHub Nepal
                    </p>
                    <Link
                        to="/register"
                        className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg inline-block"
                    >
                        Create Free Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">
                        © 2024 KrishiHub Nepal. All rights reserved.
                    </p>
                    <p className="text-gray-500 mt-2">
                        Connecting Farmers and Buyers Across Nepal 🇳🇵
                    </p>
                </div>
            </footer>
        </div>
    );
}
