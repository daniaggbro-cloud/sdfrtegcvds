
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, UserRole, Task, ChatMessage, RobloxAccount, AccountMarketStatus, AuditLogEntry } from './types';
import { AIChatBot } from './components/AIChatBot';

// --- Hardcoded Data ---
const EMPLOYEES: User[] = [
  { id: '1', username: 'Denis_neg41', role: UserRole.EMPLOYEE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Denis1', status: 'online' },
  { id: '2', username: 'Denis_Densippp', role: UserRole.EMPLOYEE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Denis2', status: 'busy' },
];

const ADMIN_USER: User = { id: '0', username: 'BigBoss', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Boss', status: 'online' };

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Підготувати 10 акаунтів до продажу', description: '', assignedTo: '1', status: 'in-progress', priority: 'high' },
  { id: 't2', title: 'Перевірити виплати з маркетплейсу', description: '', assignedTo: '2', status: 'pending', priority: 'medium' },
];

const INITIAL_ACCOUNTS: RobloxAccount[] = [
  { id: 'a1', username: 'CoolGamer_123', password: 'password123', cookie: '_|WARNING:-DO-NOT-SHARE-THIS...|_12345', robuxBalance: 450, premium: true, status: 'active', marketStatus: 'for_sale', lastChecked: new Date(), price: 150 },
  { id: 'a2', username: 'RobloxKing_99', password: 'securePass!', cookie: '_|WARNING:-DO-NOT-SHARE-THIS...|_67890', robuxBalance: 12455, premium: false, status: 'active', marketStatus: 'reserved', lastChecked: new Date(), price: 2500 },
  { id: 'a3', username: 'NoobMaster69', password: '12345678', robuxBalance: 5, premium: false, status: 'banned', marketStatus: 'banned', lastChecked: new Date(), price: 0 },
  { id: 'a4', username: 'ProBuilder_X', password: 'xPass2024', robuxBalance: 1200, premium: true, status: 'active', marketStatus: 'for_sale', lastChecked: new Date(), price: 450 },
];

interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning';
  text: string;
}

export default function App() {
  const [accessStage, setAccessStage] = useState<1 | 2>(1);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [error, setError] = useState('');

  const [currentView, setCurrentView] = useState<'dashboard' | 'accounts' | 'audits'>('accounts');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [accounts, setAccounts] = useState<RobloxAccount[]>(INITIAL_ACCOUNTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [accountSearch, setAccountSearch] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [checkingAccountId, setCheckingAccountId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  
  // State for editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<RobloxAccount | null>(null);

  const [teamMessages, setTeamMessages] = useState<ChatMessage[]>([
    { id: 'm1', senderId: '1', content: 'Бос, я виставив нову партію на продаж.', timestamp: new Date(Date.now() - 3600000) },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addNotification = (text: string, type: AppNotification['type'] = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [{ id, text, type }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const addAuditLog = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLogEntry = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      action,
      details,
      timestamp: new Date()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (loginUser === 'admin' && loginPass === 'admin') {
      setCurrentUser(ADMIN_USER); setAccessStage(2); 
      addNotification('Доступ надано. Вітаємо, Бос!', 'success');
      return;
    }
    const emp = EMPLOYEES.find(u => u.username === loginUser);
    const validPass = emp?.id === '1' ? 'DenisDenisz3351A' : 'DENSIPPPXXX9009GG';
    if (emp && loginPass === validPass) {
      setCurrentUser(emp); setAccessStage(2);
      addNotification(`Вхід виконано: ${emp.username}`, 'info');
      return;
    }
    setError('Невірний ключ або ідентифікатор');
  };

  const handleCheckAccount = (id: string) => {
    setCheckingAccountId(id);
    addNotification('Перевірка даних...', 'info');
    setTimeout(() => {
      setCheckingAccountId(null);
      addNotification('Дані синхронізовано.', 'success');
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, lastChecked: new Date() } : a));
    }, 1500);
  };

  const handleEditClick = (acc: RobloxAccount) => {
    setEditingAccount({ ...acc });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    const original = accounts.find(a => a.id === editingAccount.id);
    setAccounts(prev => prev.map(a => a.id === editingAccount.id ? editingAccount : a));
    setIsEditModalOpen(false);
    
    // Log the change
    addAuditLog('ЗМІНА АКАУНТУ', `Користувач оновив дані акаунта ${editingAccount.username} (Ціна: ${original?.price} -> ${editingAccount.price})`);
    
    setEditingAccount(null);
    addNotification('Акаунт успішно оновлено', 'success');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        let nextStatus: Task['status'] = 'pending';
        let statusMsg = '';
        if (t.status === 'pending') {
          nextStatus = 'in-progress';
          statusMsg = 'завдання в роботі';
        } else if (t.status === 'in-progress') {
          nextStatus = 'completed';
          statusMsg = 'завдання виконано';
        } else {
          nextStatus = 'pending';
          statusMsg = 'завдання скинуто';
        }
        
        addAuditLog('СТАТУС ЗАВДАННЯ', `Змінено статус завдання "${t.title}" на ${nextStatus.toUpperCase()}`);
        addNotification(`Статус оновлено: ${statusMsg}`, 'info');
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), senderId: currentUser?.id || '0', content: newMessage, timestamp: new Date() };
    setTeamMessages(prev => [...prev, msg]);
    setNewMessage('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification(`${label} скопійовано!`, 'success');
  };

  const toggleSensitive = (id: string) => {
    setShowSensitive(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalRobux = useMemo(() => accounts.reduce((a, b) => a + b.robuxBalance, 0), [accounts]);
  const totalValue = useMemo(() => accounts.reduce((a, b) => a + (b.price || 0), 0), [accounts]);
  const filteredAccounts = useMemo(() => accounts.filter(acc => acc.username.toLowerCase().includes(accountSearch.toLowerCase())), [accounts, accountSearch]);

  const marketStatusLabel = (status: AccountMarketStatus) => {
    switch(status) {
      case 'for_sale': return 'У ПРОДАЖУ';
      case 'sold': return 'ПРОДАНО';
      case 'reserved': return 'РЕЗЕРВ';
      case 'banned': return 'БАН';
      case 'checking': return 'ТЕСТ';
      default: return status;
    }
  };

  const taskStatusLabel = (status: Task['status']) => {
    switch(status) {
      case 'pending': return 'ОЧІКУЄ';
      case 'in-progress': return 'В РОБОТІ';
      case 'completed': return 'ВИКОНАНО';
      default: return status;
    }
  };

  const taskStatusColor = (status: Task['status']) => {
    switch(status) {
      case 'pending': return 'bg-slate-500/10 text-slate-400 border-white/10';
      case 'in-progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-white/10';
    }
  };

  if (accessStage === 1) {
    return (
      <div className="h-screen bg-[#050810] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,#1a1f35_0%,#050810_100%)] overflow-hidden">
        <div className="glass w-full max-w-sm rounded-[2.5rem] p-10 border border-white/5 shadow-2xl animate-fade-in-up">
          <div className="text-center mb-10">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-2xl shadow-indigo-600/40 mx-auto mb-5">N</div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Nexus <span className="text-indigo-500">Core</span></h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Ідентифікатор" className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-5 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 font-bold" />
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Ключ" className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-5 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 font-bold" />
            {error && <p className="text-red-500 text-[10px] font-black uppercase text-center mt-2">{error}</p>}
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all mt-4">Вхід в Систему</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050810] text-slate-300 flex flex-col font-['Inter'] overflow-hidden">
      
      {/* Edit Modal */}
      {isEditModalOpen && editingAccount && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="glass w-full max-w-lg rounded-[2.5rem] p-10 border border-indigo-500/30 shadow-2xl animate-fade-in-up">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Редагувати <span className="text-indigo-500">Асет</span></h3>
               <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</label>
                     <input type="text" value={editingAccount.username} onChange={e => setEditingAccount({...editingAccount, username: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none transition-all font-bold" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Robux Balance</label>
                     <input type="number" value={editingAccount.robuxBalance} onChange={e => setEditingAccount({...editingAccount, robuxBalance: Number(e.target.value)})} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none transition-all font-bold" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                   <input type="text" value={editingAccount.password} onChange={e => setEditingAccount({...editingAccount, password: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none transition-all font-bold" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Cookie</label>
                   <textarea rows={2} value={editingAccount.cookie} onChange={e => setEditingAccount({...editingAccount, cookie: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none transition-all font-mono text-[10px]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ціна (₴)</label>
                     <input type="number" value={editingAccount.price} onChange={e => setEditingAccount({...editingAccount, price: Number(e.target.value)})} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none transition-all font-bold" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Статус Маркету</label>
                     <select value={editingAccount.marketStatus} onChange={e => setEditingAccount({...editingAccount, marketStatus: e.target.value as AccountMarketStatus})} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none transition-all font-bold appearance-none">
                        <option value="for_sale">У ПРОДАЖУ</option>
                        <option value="sold">ПРОДАНО</option>
                        <option value="reserved">РЕЗЕРВ</option>
                        <option value="banned">БАН</option>
                        <option value="checking">ТЕСТ</option>
                     </select>
                   </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all mt-4">Зберегти зміни</button>
             </form>
          </div>
        </div>
      )}

      <div className="fixed top-8 right-8 z-[100] space-y-4 w-72">
        {notifications.map(n => (
          <div key={n.id} className="p-5 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl shadow-2xl animate-fade-in-right flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-indigo-500'}`}></div>
            <p className="text-[10px] font-black uppercase tracking-tight text-white/90">{n.text}</p>
          </div>
        ))}
      </div>

      <header className="h-24 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl flex items-center justify-between px-10 z-50 shrink-0">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-indigo-600/30">N</div>
          <div>
            <h1 className="font-black text-2xl tracking-tighter text-white uppercase italic">Ядро <span className="text-indigo-500">Nexus</span></h1>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Asset Management System</p>
          </div>
        </div>

        <div className="hidden md:flex items-center glass border-white/5 rounded-2xl px-10 py-3 gap-12 shadow-xl">
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Загальні Робукси</p>
             <p className="text-xl font-mono font-black text-white">{totalRobux.toLocaleString()} <span className="text-indigo-500 text-sm">R$</span></p>
           </div>
           <div className="w-px h-10 bg-white/5"></div>
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Оцінка Активів</p>
             <p className="text-xl font-mono font-black text-white">{totalValue.toLocaleString()} <span className="text-indigo-500 text-sm">₴</span></p>
           </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-base font-black text-white leading-none">{currentUser?.username}</p>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1.5">{currentUser?.role === UserRole.ADMIN ? 'БОС' : 'СПІВРОБІТНИК'}</p>
          </div>
          <img src={currentUser?.avatar} className="w-12 h-12 rounded-xl border-2 border-white/5 bg-slate-800 shadow-xl" />
          <button onClick={() => setAccessStage(1)} className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m4 4H7" /></svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <nav className="w-24 bg-slate-950/20 border-r border-white/5 flex flex-col items-center py-10 gap-10 shrink-0">
           <button onClick={() => setCurrentView('dashboard')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
           </button>
           <button onClick={() => setCurrentView('accounts')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${currentView === 'accounts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6" /></svg>
           </button>
           {currentUser?.role === UserRole.ADMIN && (
             <button onClick={() => setCurrentView('audits')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${currentView === 'audits' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             </button>
           )}
        </nav>

        <main className="flex-1 flex flex-col p-10 overflow-y-auto min-w-0 bg-[#050810] custom-scrollbar">
          {currentView === 'accounts' ? (
            <div className="animate-fade-in space-y-10">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Інвентар</h2>
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3 opacity-70">База даних активних акаунтів</p>
                </div>
                <div className="relative w-full xl:w-96">
                   <input type="text" value={accountSearch} onChange={e => setAccountSearch(e.target.value)} placeholder="Шукати асет..." className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-8 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800 font-bold text-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                {filteredAccounts.map(acc => (
                  <div key={acc.id} className={`glass rounded-[2.5rem] p-8 border-2 transition-all duration-300 ${selectedAccountId === acc.id ? 'neon-border scale-[1.01]' : 'border-white/5'} ${checkingAccountId === acc.id ? 'animate-scan' : ''}`} onClick={() => setSelectedAccountId(acc.id)}>
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-950 rounded-[1.2rem] flex items-center justify-center font-black text-2xl text-indigo-500 border border-white/5 shadow-inner">{acc.username[0]}</div>
                        <div>
                          <h3 className="font-black text-lg text-white truncate max-w-[150px] leading-tight">{acc.username}</h3>
                          <p className="text-xs font-mono font-black text-slate-500 mt-1 uppercase tracking-tighter">{acc.robuxBalance.toLocaleString()} R$</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${acc.marketStatus === 'for_sale' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-slate-500 border-white/10 bg-white/5'}`}>
                          {marketStatusLabel(acc.marketStatus)}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(acc); }} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all border border-indigo-500/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8 bg-black/40 p-6 rounded-[1.5rem] border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Дані доступу</span>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleSensitive(acc.id); }} className="p-2 bg-white/5 rounded-lg hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /></svg></button>
                          <button onClick={(e) => { e.stopPropagation(); copyToClipboard(acc.password || '', 'Пароль'); }} className="p-2 bg-white/5 rounded-lg hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                        </div>
                      </div>
                      <div className="text-sm font-mono font-bold text-white tracking-widest">{showSensitive[acc.id] ? acc.password : '••••••••••••'}</div>
                      <div className="h-px bg-white/5"></div>
                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(acc.cookie || '', 'Cookie'); }} className="w-full text-left text-[10px] font-mono text-indigo-400/70 truncate hover:text-indigo-400 transition-colors">
                        {showSensitive[acc.id] ? acc.cookie : 'Cookie: ••••••••••••••••••'}
                      </button>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-[1.3] bg-white text-black py-4 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-white/5">{acc.price} ₴</div>
                      <button onClick={(e) => { e.stopPropagation(); handleCheckAccount(acc.id); }} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white border border-white/10 hover:bg-slate-800 transition-all">{checkingAccountId === acc.id ? 'CHECK...' : 'ОНОВИТИ'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentView === 'audits' ? (
            <div className="animate-fade-in space-y-10">
               <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Журнал <span className="text-indigo-500">Аудиту</span></h2>
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3 opacity-70">Відстеження всіх змін у системі</p>
                </div>

                <div className="glass rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="border-b border-white/5">
                               <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Час</th>
                               <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Користувач</th>
                               <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Дія</th>
                               <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Деталі</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                            {auditLogs.length === 0 ? (
                               <tr>
                                  <td colSpan={4} className="py-10 text-center text-slate-600 font-bold italic">Журнал наразі порожній</td>
                               </tr>
                            ) : (
                              auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                   <td className="py-5 px-6 font-mono text-[11px] text-indigo-400">{log.timestamp.toLocaleTimeString()}</td>
                                   <td className="py-5 px-6 font-black text-white text-xs">{log.username}</td>
                                   <td className="py-5 px-6">
                                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[9px] font-black uppercase">{log.action}</span>
                                   </td>
                                   <td className="py-5 px-6 text-slate-400 text-xs">{log.details}</td>
                                </tr>
                              ))
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-10 animate-fade-in overflow-hidden">
                <div className="glass rounded-[2.5rem] p-10 flex flex-col border-white/5 shadow-2xl overflow-hidden">
                  <div className="flex justify-between items-center mb-8 shrink-0">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 italic">Сектор зв'язку</h3>
                    <span className="text-[10px] font-black text-green-500 uppercase flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Активний</span>
                  </div>
                  <div className="flex-1 space-y-5 overflow-y-auto mb-8 pr-4 custom-scrollbar text-sm">
                    {teamMessages.map(m => (
                      <div key={m.id} className={`flex ${m.senderId === currentUser?.id ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] shadow-lg ${m.senderId === currentUser?.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-300 rounded-bl-none border border-white/5'}`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-4 shrink-0">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Введіть повідомлення..." className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500 outline-none transition-all" />
                    <button className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </form>
                </div>

                <div className="glass rounded-[2.5rem] p-10 border-white/5 shadow-2xl overflow-y-auto custom-scrollbar">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 mb-8 italic">Поточні завдання</h3>
                   <div className="space-y-4">
                     {tasks.map(t => (
                       <div key={t.id} className="p-6 bg-white/5 rounded-[1.8rem] border border-white/5 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                         <div className="flex flex-col">
                           <span className="font-black text-white text-base uppercase italic leading-none">{t.title}</span>
                           <span className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">Пріоритет: {t.priority === 'high' ? 'Критичний' : 'Нормальний'}</span>
                         </div>
                         <button 
                            onClick={() => handleToggleTaskStatus(t.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${taskStatusColor(t.status)}`}
                         >
                            {taskStatusLabel(t.status)}
                         </button>
                       </div>
                     ))}
                   </div>
                </div>
            </div>
          )}
        </main>

        <aside className="hidden xl:flex w-[400px] border-l border-white/5 bg-slate-950/20 flex flex-col shrink-0 transition-all overflow-hidden">
          <AIChatBot />
        </aside>
      </div>
    </div>
  );
}
