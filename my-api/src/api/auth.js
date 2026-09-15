const API_URL = 'http://localhost:5000/api/auth';

export async function loginUser(email, password) {
    let response;

    try {
        response = await fetch(
            `${API_URL}/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );
    } catch {
        throw new Error('Не удалось подключиться к серверу');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
    }

    return data;
}


export async function registerUser(userData) {
    let response;

    try {
        response = await fetch(
            `${API_URL}/register`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            }
        );
    } catch {
        throw new Error('Не удалось подключиться к серверу');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
    }

    return data;
}