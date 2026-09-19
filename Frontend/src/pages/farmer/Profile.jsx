import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function Profile() {

    const { token } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        phone: "",
        village: "",
        district: "",
        state: ""
    });

    const [message, setMessage] = useState("");

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
                "http://localhost:5000/api/farmer/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setMessage(data.message);
            }

        } catch (error) {

            console.error(error);
            setMessage("Something went wrong");

        }
    };

    return (
        <div>

            <h1>Farmer Profile</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="village"
                    placeholder="Village"
                    value={formData.village}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="district"
                    placeholder="District"
                    value={formData.district}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                />

                <button type="submit">
                    Save Profile
                </button>

            </form>

            <p>{message}</p>

        </div>
    );
}

export default Profile;