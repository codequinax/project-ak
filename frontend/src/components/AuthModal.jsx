import { useState } from "react"

export default function AuthModal({ close, setUser }) {

    const [mode, setMode] = useState("login")

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleRegister = (e) => {
        e.preventDefault()

        if (!form.firstName || !form.email || !form.password) {
            alert("First name, email and password required")
            return
        }

        sessionStorage.setItem("pyq_user", JSON.stringify(form))
        setUser(form)
        close()
    }

    const handleLogin = (e) => {
        e.preventDefault()

        const stored = JSON.parse(sessionStorage.getItem("pyq_user"))

        if (!stored) {
            alert("No registered user")
            return
        }

        if (
            stored.email === form.email &&
            stored.password === form.password
        ) {
            setUser(stored)
            close()
        } else {
            alert("Invalid credentials")
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

            <div className="bg-white rounded-xl w-96 p-6 shadow-xl">

                <h2 className="text-2xl font-semibold mb-4 text-center">
                    {mode === "login" ? "Login" : "Register"}
                </h2>

                <form
                    onSubmit={mode === "login" ? handleLogin : handleRegister}
                    className="space-y-3"
                >

                    {mode === "register" && (
                        <>
                            <input
                                name="firstName"
                                placeholder="First Name *"
                                className="w-full border p-2 rounded"
                                onChange={handleChange}
                            />

                            <input
                                name="lastName"
                                placeholder="Last Name (optional)"
                                className="w-full border p-2 rounded"
                                onChange={handleChange}
                            />
                        </>
                    )}

                    <input
                        name="email"
                        placeholder="Email"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                    />

                    <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                        {mode === "login" ? "Login" : "Register"}
                    </button>

                </form>

                <div className="text-center mt-3 text-sm">

                    {mode === "login" ? (
                        <button
                            onClick={() => setMode("register")}
                            className="text-indigo-600"
                        >
                            Create account
                        </button>
                    ) : (
                        <button
                            onClick={() => setMode("login")}
                            className="text-indigo-600"
                        >
                            Already have account?
                        </button>
                    )}

                </div>

                <button
                    onClick={close}
                    className="absolute top-4 right-4 text-gray-500"
                >
                    ✕
                </button>

            </div>
        </div>
    )
}