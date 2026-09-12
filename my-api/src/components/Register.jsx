import { useState } from 'react';
import { registerUser } from '../api/auth';

function Register() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        phone: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = event => {
        const { name, value } = event.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = event => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!form.email.trim() || !form.password.trim() || !form.first_name.trim()) {
            setError('Заполните обязательные поля');
            return;
        }

        setLoading(true);

        registerUser(form)
            .then(data => {
                setSuccess(data.message);
                setForm({
                    email: '',
                    password: '',
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    phone: ''
                });
            })
            .catch(error => {
                setError(error.message || 'Ошибка регистрации');
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="page">
            <div className="form-card">
                <h2>Регистрация</h2>

                <form onSubmit={handleSubmit}>
                    <input className="input field" name="first_name" placeholder="Имя *" value={form.first_name} onChange={handleChange} />
                    <input className="input field" name="last_name" placeholder="Фамилия" value={form.last_name} onChange={handleChange} />
                    <input className="input field" name="middle_name" placeholder="Отчество" value={form.middle_name} onChange={handleChange} />
                    <input className="input field" name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} />
                    <input className="input field" name="password" type="password" placeholder="Пароль *" value={form.password} onChange={handleChange} />
                    <input className="input field" name="phone" placeholder="Телефон" value={form.phone} onChange={handleChange} />

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <button type="submit" disabled={loading} className="button">
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;