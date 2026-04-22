import { useState, useEffect } from 'react'

function App() {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Auth Form
  const [authMode, setAuthMode] = useState('login'); // login or signup
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Post Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editId, setEditId] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || "https://blog-app-b5d7.onrender.com";

  useEffect(() => {
    // Check if user is logged in via localStorage
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedId = localStorage.getItem('userId');
    if (token && storedUsername) {
      setUser({ token, username: storedUsername, id: storedId });
    }
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error loading blogs", error);
    }
  };

  const handleAuth = async () => {
    const endpoint = authMode === 'login' ? '/login' : '/signup';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.id);
        setUser({ token: data.token, username: data.username, id: data.id });
        setIsAuthModalOpen(false);
        setUsername('');
        setPassword('');
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const createBlog = async () => {
    if (!title || !content) {
      alert("Please enter title and content.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setTitle('');
        setContent('');
        loadBlogs();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBlog = async (id) => {
    if (!confirm("Are you sure you want to delete this exquisite artifact?")) return;
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        loadBlogs();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (blog) => {
    setEditId(blog._id);
    setTitle(blog.title);
    setContent(blog.content);
    setIsEditModalOpen(true);
  };

  const submitEditBlog = async () => {
    if (!title || !content) {
      alert("Please fill in both fields");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/posts/${editId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setTitle('');
        setContent('');
        loadBlogs();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen dark">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-tertiary/5 blur-[120px]"></div>
      </div>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#070d1f]/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(105,156,255,0.05)]">
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#699cff] hover:bg-[#131e3c]/50 transition-colors p-2 rounded-full active:scale-95 duration-300">menu</button>
          <h1 className="text-2xl font-black tracking-tighter text-[#699cff] font-headline uppercase">LUMINOUS</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8">
            <a href="#" className="font-headline tracking-tighter font-bold uppercase text-[#699cff] nav-link active">Feed</a>
          </nav>
          {user ? (
            <div className="flex items-center gap-4 z-50">
               <span className="font-label text-sm text-[#dfe4ff] hidden sm:block">Hello, {user.username}</span>
               <button onClick={logout} className="px-4 py-2 rounded-xl bg-error/20 text-error hover:bg-error hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Logout</button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-[#000] transition-colors text-xs font-bold uppercase tracking-widest z-50">Login</button>
          )}
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-b from-[#131e3c] to-transparent h-px w-full opacity-20"></div>
      </header>

      {/* NavigationDrawer (Sidebar) */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 p-6 pb-10 flex flex-col gap-4 bg-[#070d1f]/70 backdrop-blur-3xl w-72 rounded-r-3xl shadow-[20px_0_40px_rgba(0,0,0,0.4)] hidden lg:flex">
        {user ? (
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden flex items-center justify-center bg-primary text-[#000] font-bold text-xl uppercase">
              {user.username.charAt(0)}
            </div>
            <div>
              <h3 className="font-headline text-sm font-bold text-on-surface">{user.username}</h3>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Author</p>
            </div>
          </div>
        ) : (
           <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden flex items-center justify-center material-symbols-outlined text-on-surface-variant">person</div>
              <div>
                <h3 className="font-headline text-sm font-bold text-on-surface">Guest</h3>
              </div>
           </div>
        )}
        
        <nav className="flex flex-col gap-2 sidebar-nav">
          <a href="#" className="flex items-center gap-4 px-4 py-3 bg-gradient-to-br from-[#699cff] to-[#4388fd] text-white rounded-xl shadow-[0_4px_15px_rgba(105,156,255,0.3)] font-headline text-sm font-medium transition-all hover:translate-x-1 duration-200">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
            <span>Curated Feed</span>
          </a>
        </nav>
        
        <div className="mt-auto pt-8">
          <div className="glass-card ghost-border rounded-2xl p-4">
            <p className="font-headline text-xs text-on-surface-variant leading-relaxed">Storage usage</p>
            <div className="h-1.5 w-full bg-surface-container rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(105,156,255,0.5)] transition-all duration-1000" style={{width: `${Math.min((blogs.length/100)*100, 100)}%`}}></div>
            </div>
            <p className="font-label text-[10px] text-on-surface-variant mt-2 text-right">{blogs.length} Posts</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-24 pb-32 px-6 md:px-10 min-h-screen relative z-10">
        <header className="mb-12">
          <h2 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-on-surface">Curated<br/><span className="text-primary-dim">Artifacts</span></h2>
          <div className="mt-4 flex items-center gap-4">
            <span className="h-px w-12 bg-primary"></span>
            <p className="font-label text-sm uppercase tracking-[0.2em] text-on-surface-variant">Editorial Selection</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-auto gap-8 items-start">
          {blogs.map((b) => (
            <article key={b._id} className="group rounded-[1.5rem] glass-card ghost-border overflow-hidden flex flex-col h-full min-h-[250px]">
              <div className="p-8 flex flex-col gap-4 h-full">
                <h3 className="text-xl font-headline font-bold leading-tight text-white">{b.title}</h3>
                <p className="text-on-surface-variant text-sm font-light leading-relaxed flex-grow whitespace-pre-wrap">{b.content}</p>
                <div className="pt-4 flex justify-between items-center border-t border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="font-label text-[10px] text-on-surface-variant uppercase">{new Date(b.createdAt).toLocaleDateString()}</span>
                    {b.author && <span className="font-label text-[10px] text-primary uppercase">By: {b.author.username}</span>}
                  </div>
                  {user && user.id === (b.author ? b.author._id : b.author) && (
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(b)} className="text-[#699cff] hover:text-white transition-colors bg-white/5 p-2 rounded-full backdrop-blur-md">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => deleteBlog(b._id)} className="text-[#fd6f85] hover:text-white transition-colors bg-white/5 p-2 rounded-full backdrop-blur-md">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* FAB (Create Post) */}
      {user && (
        <button onClick={() => {setTitle(''); setContent(''); setIsCreateModalOpen(true);}} className="fixed bottom-10 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_12px_40px_rgba(105,156,255,0.4)] flex items-center justify-center text-white z-50 hover:scale-110 transition-transform active:scale-95 group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
        </button>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="glass-card ghost-border w-11/12 md:w-full max-w-md rounded-[2rem] p-8 flex flex-col gap-6 shadow-2xl relative transform transition-all">
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors material-symbols-outlined rounded-full p-2 bg-white/5">close</button>
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight">{authMode === 'login' ? 'Welcome Back' : 'Join Luminous'}</h2>
            
            <div className="flex flex-col gap-4">
              <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-surface-container-lowest text-white border border-outline-variant/30 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-headline" placeholder="Username" />
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-surface-container-lowest text-white border border-outline-variant/30 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-headline" placeholder="Password" />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <button onClick={handleAuth} className="w-full py-3 rounded-xl bg-gradient-to-br from-[#699cff] to-[#4388fd] text-[#000311] font-extrabold hover:translate-y-[-2px] transition-all">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-sm text-on-surface-variant hover:text-white transition-colors">
                {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="glass-card ghost-border w-11/12 md:w-3/4 max-w-2xl rounded-[2rem] p-8 flex flex-col gap-6 shadow-2xl relative transform transition-all">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors material-symbols-outlined rounded-full p-2 bg-white/5">close</button>
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Craft New Artifact</h2>
            <div className="flex flex-col gap-5">
              <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-surface-container-lowest text-white border border-outline-variant/30 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-headline text-lg" placeholder="Title of your post..." />
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows="6" className="w-full bg-surface-container-lowest text-white border border-outline-variant/30 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body resize-y" placeholder="Pour your thoughts here..."></textarea>
            </div>
            <div className="flex justify-end gap-4 mt-2">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 rounded-xl bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors font-bold text-sm ghost-border">Cancel</button>
              <button onClick={createBlog} className="px-8 py-3 rounded-xl bg-gradient-to-br from-[#699cff] to-[#4388fd] text-[#000311] font-extrabold hover:translate-y-[-2px] transition-all flex items-center gap-2">
                <span>Publish</span>
                <span className="material-symbols-outlined text-sm font-bold">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="glass-card ghost-border w-11/12 md:w-3/4 max-w-2xl rounded-[2rem] p-8 flex flex-col gap-6 shadow-2xl relative transform transition-all">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors material-symbols-outlined rounded-full p-2 bg-white/5">close</button>
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Edit Artifact</h2>
            <div className="flex flex-col gap-5">
              <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-surface-container-lowest text-white border border-outline-variant/30 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-headline text-lg" placeholder="Title of your post..." />
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows="6" className="w-full bg-surface-container-lowest text-white border border-outline-variant/30 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body resize-y" placeholder="Pour your thoughts here..."></textarea>
            </div>
            <div className="flex justify-end gap-4 mt-2">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-xl bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors font-bold text-sm ghost-border">Cancel</button>
              <button onClick={submitEditBlog} className="px-8 py-3 rounded-xl bg-gradient-to-br from-[#699cff] to-[#4388fd] text-[#000311] font-extrabold hover:translate-y-[-2px] transition-all flex items-center gap-2">
                <span>Update</span>
                <span className="material-symbols-outlined text-sm font-bold">save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
