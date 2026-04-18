"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Loader2, Shield, ShieldOff, Ban } from "lucide-react";
import { UserData } from "../../../../store/authStore";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map(doc => doc.data() as UserData);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Change user to ${newRole}?`)) return;
    
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  const handleToggleBan = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "banned" ? "approved" : "banned";
    if (!confirm(`Are you sure you want to ${newStatus === 'banned' ? 'ban' : 'unban'} this user?`)) return;
    
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      setUsers(users.map(u => u.uid === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">View all members and manage their roles and access.</p>
      </div>

      <div className="glass rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className={`border-b border-border/50 hover:bg-muted/20 ${u.status === 'banned' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${u.role === 'admin' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-muted text-muted-foreground border-border'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${u.status === 'approved' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRole(u.uid, u.role)}
                        className="p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
                        title={u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      >
                        {u.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleToggleBan(u.uid, u.status)}
                        className={`p-2 rounded-md transition-colors ${u.status === 'banned' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-destructive/10 text-destructive hover:bg-destructive/20'}`}
                        title={u.status === 'banned' ? 'Unban User' : 'Ban User'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
