import { createContext , useState , useContext , useEffect } from "react";
import {loginUser , registerUser } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null);
    const [token,setToken] = useState(localStorage.getItem('token') || null);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(null);


    useEffect(()=>{
        const savedUser = localStorage.getItem('user');
        if(savedUser) setUser(JSON.parse(savedUser));
    },[]);

    const register = async (name,email,password)=>{
        setLoading(true);
        setError(null);
        try{
            await registerUser({name,email,password});
            setLoading(false);
            return true;
        }catch(err){
            setError(err.response?.data?.message || "Registeration failed");
            setLoading(false);
            return false;
        }
    };

    const login = async (email,password)=>{
        setLoading(true);
        setError(null);
        try{
            const res = await loginUser({email,password});
            const {token,user} = res.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('token',token);
            localStorage.setItem('user',JSON.stringify(user));
            setLoading(false);
            return true;
        }catch(err){
            setError(err.response?.data?.message || 'Login failed')
            setLoading(false);
            return false;
        }
    };

    const logout = ()=>{
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{user,token,loading,error,register,login,logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = ()=>useContext(AuthContext);