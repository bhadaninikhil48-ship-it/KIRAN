import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();
            if (response.ok) {
                login(data.user, data.token);

                if (data.user.role === "buyer") {
                    navigate("/buyer/dashboard");
                } else if (data.user.role === "farmer") {
                    navigate("/farmer/dashboard");
                } else if (data.user.role === "fpo") {
                    navigate("/fpo/dashboard");
                }
            } else {
                console.log(data.message);
            }

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>

            <h1>Login</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>
    );
}

export default Login;