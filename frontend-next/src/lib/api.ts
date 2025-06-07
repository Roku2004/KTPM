const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface FetchOptions extends RequestInit {
    body?: any
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
    try {
        console.log('=== Starting API Call ===')
        console.log('Endpoint:', endpoint)
        console.log('API_URL:', API_URL)

        const { body, headers: customHeaders, ...fetchOptions } = options

        const headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(customHeaders as Record<string, string> || {}),
        })

        // Thêm token vào header nếu có
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
            try {
                const { token } = JSON.parse(userInfo)
                if (token) {
                    headers.append('Authorization', `Bearer ${token}`)
                }
            } catch (e) {
                console.error('Lỗi khi parse userInfo:', e)
            }
        }

        // Đảm bảo body là string JSON hợp lệ
        let bodyString: string | undefined
        if (body) {
            try {
                bodyString = JSON.stringify(body)
            } catch (e) {
                console.error('Lỗi khi stringify body:', e)
                throw new Error('Dữ liệu gửi lên không hợp lệ')
            }
        }

        const url = `${API_URL}${endpoint}`
        console.log('Full URL:', url)

        try {
            console.log('Sending request...')
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
                body: bodyString,
            })

            console.log('Response status:', response.status)
            const text = await response.text()
            console.log('Response text:', text)

            if (!text) {
                return {}
            }

            // Kiểm tra nếu response là HTML
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                console.error('Received HTML instead of JSON:', text.substring(0, 200))
                throw new Error('Server không trả về dữ liệu JSON hợp lệ. Có thể server đang không chạy hoặc endpoint không đúng.')
            }

            try {
                const data = JSON.parse(text)
                console.log('Parsed data:', data)
                return data
            } catch (e) {
                console.error('Parse error:', e)
                throw new Error('Server không trả về dữ liệu JSON hợp lệ')
            }
        } catch (error) {
            console.error('Fetch error:', error)
            throw error
        }
    } catch (error: any) {
        console.error('API error:', error)
        throw error
    }
}

// Authentication functions
export async function login(username: string, password: string) {
    console.log('=== Login Function ===')
    console.log('Username:', username)

    try {
        console.log('Calling login API...')
        const response = await fetchApi('/api/users/login', {
            method: 'POST',
            body: { username, password }
        })

        console.log('Login response:', response)

        if (!response || typeof response !== 'object') {
            console.error('Invalid response:', response)
            throw new Error('Response không hợp lệ')
        }

        // Kiểm tra nếu response có success: false
        if (response.success === false) {
            throw new Error(response.message || 'Đăng nhập thất bại')
        }

        // Kiểm tra nếu response có success: true và data
        if (response.success === true && response.data) {
            return {
                success: true,
                data: {
                    token: response.data.token,
                    user: {
                        _id: response.data._id,
                        username: response.data.username,
                        fullName: response.data.fullName,
                        role: response.data.role,
                        email: response.data.email,
                        phone: response.data.phone
                    }
                }
            }
        }

        console.error('Unexpected response:', response)
        throw new Error('Dữ liệu đăng nhập không hợp lệ')
    } catch (error: any) {
        console.error('Login error:', error)
        return { success: false, message: error.message }
    }
}

export async function register(userData: any) {
    return fetchApi('/users/register', {
        method: 'POST',
        body: userData
    })
}

export async function checkToken() {
    const token = localStorage.getItem('token')
    if (!token) {
        throw new Error('No token found')
    }

    return fetchApi('/users/check-token', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}