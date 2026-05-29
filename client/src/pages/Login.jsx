import {useState} from "react"
import {useAuth} from "../context/AuthContext"
import {useNavigate,Link} from "react-router-dom"

const Login = ()=>{
    const {login,error,loading} = useAuth();
    const navigate = useNavigate();
    const [form,setForm] = useState({email:"",password:""});

    const handleChange = (e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();
        const ok = await login(form.email,form.password);
        if(ok)navigate('/dashboard');
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Welcome back</h2>
                <p>Login to start</p>
                {error && <p style={styles.error}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <input 
                        style={styles.input}
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input 
                        style={styles.input}
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p>Don't have an account? <Link to="/register">register here</Link></p>
            </div>
        </div>
    );
};


const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', backgroundColor:'#f0f4f8' },
  card:      { background:'white', padding:'40px', borderRadius:'12px', width:'380px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  input:     { width:'100%', padding:'12px', margin:'8px 0', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' },
  button:    { width:'100%', padding:'12px', marginTop:'12px', backgroundColor:'#6c63ff', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  error:     { color:'red', fontSize:'14px' },
};

export default Login;