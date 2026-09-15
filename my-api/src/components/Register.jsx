import { useState } from 'react';
import { registerUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const nameRegex = /^[А-Яа-яЁёA-Za-z-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d{10,15}$/;

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

        if (form.phone && !phoneRegex.test(form.phone)) {   
            setError('Неверный формат номера телефона');
            return;
        }                               
        if (form.first_name.trim().length < 2) {
            setError('Имя должно содержать минимум 2 символа');
            return;
        }

        if (!nameRegex.test(form.first_name.trim())) {
            setError('Имя может содержать только буквы');
            return;
        }

        if (form.last_name.trim() && form.last_name.trim().length < 2) {
            setError('Фамилия должна содержать минимум 2 символа');
            return;
        }

        if (form.last_name.trim() && !nameRegex.test(form.last_name.trim())) {
            setError('Фамилия может содержать только буквы');
            return;
        }

        if (form.middle_name.trim() && form.middle_name.trim().length < 2) {
            setError('Отчество должно содержать минимум 2 символа');
            return;
        }

        if (form.middle_name.trim() && !nameRegex.test(form.middle_name.trim())) {
            setError('Отчество может содержать только буквы');
            return;
        }

        if (!emailRegex.test(form.email.trim())) {
            setError('Введите корректный email');
            return;
        }

        if (form.password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        if (form.phone.trim() && !phoneRegex.test(form.phone.trim())) {
            setError('Неверный формат номера телефона');
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
                navigate('/login');
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