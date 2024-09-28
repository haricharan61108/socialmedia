import React,{useState} from "react";
import axios from "axios";


function Login() {
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [message,setMessage]=useState('');

    const handleLogin=async(e)=> {
        e.preventDefault();
        if(!email || !password) {
            setMessage("Email and password are required");
            return;
        }
        try {
            const res=await axios.post('http://localhost:3001/login',{email,password},{withCredentials:true});
            setMessage(res.data.msg || "login succesfull");
            window.location.href="/hello";
        } catch (error) {
            setMessage(error.response?.data?.error || "an error occured");
        }
    }

    const handleGoogleLogin=()=> {
        window.location.href='http://localhost:3001/auth/google';
    }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200">Login</button>
        </form>
        {message && <p className="mt-4 text-red-500">{message}</p>}
        <button onClick={handleGoogleLogin} className="w-full mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200">Login with Google</button>
      </div>
    </div>
  )
}

export default Login
