import {useAuth} from "../context/AuthContext";
import { useNavigate ,Link} from "react-router-dom";

const Dashboard = ()=>{
    const {user,logout} = useAuth();
    const navigate = useNavigate();
    const handleLogout = ()=>{
        logout();
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Ai study buddy</h2>
                <h3>Welcome, {user?.name}</h3>
                <p>Email:{user?.email}</p>
                <p style={styles.badge}>You logged in successfully</p>
                <div style={styles.menu}>
                    <Link to="/upload" style={styles.menuItem}>Upload Notes</Link>
                </div>
                <button style={styles.button} onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};


const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', backgroundColor:'#f0f4f8' },
  card:      { background:'white', padding:'40px', borderRadius:'12px', width:'400px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', textAlign:'center' },
  badge:     { backgroundColor:'#e6ffed', color:'green', padding:'10px', borderRadius:'8px', margin:'16px 0' },
  button:    { padding:'12px 24px', backgroundColor:'#ff4d4d', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  menu:      { margin:'20px 0', display:'flex', flexDirection:'column', gap:'10px' },
  menuItem:  { padding:'12px', backgroundColor:'#f0f0ff', borderRadius:'8px', color:'#6c63ff', fontSize:'15px', textDecoration:'none' },
  button:    { padding:'12px 24px', backgroundColor:'#ff4d4d', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', marginTop:'10px' },
};

export default Dashboard;