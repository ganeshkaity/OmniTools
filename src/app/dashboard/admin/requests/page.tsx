"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAlertStore } from "../../../../store/alertStore";

interface SignupRequest {
  uid: string;
  name: string;
  email: string;
  dob: string;
  bio?: string;
  status: string;
  createdAt: number;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = useAlertStore();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const snap = await getDocs(collection(db, "signup_requests"));
      const data = snap.docs.map(doc => doc.data() as SignupRequest);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req: SignupRequest) => {
    try {
      // 1. Add to `users` collection
      await setDoc(doc(db, "users", req.uid), {
        uid: req.uid,
        name: req.name,
        email: req.email,
        dob: req.dob,
        role: "user",
        status: "approved",
        createdAt: Date.now()
      });
      // 2. Remove from `signup_requests`
      await deleteDoc(doc(db, "signup_requests", req.uid));
      // 3. Update UI
      setRequests(requests.filter(r => r.uid !== req.uid));
    } catch (err) {
      console.error("Failed to approve", err);
      await showAlert({ message: "Failed to approve user.", intent: "danger" });
    }
  };

  const handleReject = async (reqId: string) => {
    const ok = await showConfirm({ message: "Are you sure you want to reject this request?", intent: "warning" });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "signup_requests", reqId));
      setRequests(requests.filter(r => r.uid !== reqId));
    } catch (err) {
      console.error("Failed to reject", err);
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
        <h1 className="text-3xl font-bold tracking-tight">Signup Requests</h1>
        <p className="text-muted-foreground">Approve or reject new users asking for access.</p>
      </div>

      <div className="glass rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">DOB</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No pending requests at the moment.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.uid} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-6 py-4 font-medium">{req.name}</td>
                    <td className="px-6 py-4">{req.email}</td>
                    <td className="px-6 py-4">{req.dob}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={req.bio}>{req.bio || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(req)}
                          className="p-2 bg-accent/10 text-accent hover:bg-accent/20 rounded-md transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(req.uid)}
                          className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
