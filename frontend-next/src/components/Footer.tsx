const Footer = () => {
    return (
        <footer className="bg-gray-100 mt-auto">
            <div className="container mx-auto px-4">
                <div className="py-3 text-center">
                    <p className="text-gray-600">
                        Quản Lý Phí Chung Cư BlueMoon &copy; {new Date().getFullYear()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Team 23 - IT3180
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer