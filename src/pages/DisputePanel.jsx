import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton.jsx";

/**
 * DisputePanel.jsx
 * - Admin view: view and resolve buyer/seller disputes
 * - Animated, colorful, extensible
 * - Tracks status, provides resolution, comments, and action logs
 **/

// Demo: dummy disputes; replace with real API or context later
const DUMMY_DISPUTES = [
  {
    id: "DP20251001",
    raisedBy: "Priya",
    role: "buyer",
    status: "Open",
    subject: "Delay in delivery",
    message: "My order #ORD177 arrived 1 week late. Please compensate.",
    history: [
      { time: "2025-10-14T19:31", status: "Opened", comment: "Reported delay." }
    ]
  },
  {
    id: "DP20251005",
    raisedBy: "Rahul",
    role: "seller",
    status: "Investigating",
    subject: "Buyer marked delivered before arrival",
    message: "Buyer claimed order #ORD210 as delivered without getting parcel.",
    history: [
      { time: "2025-10-20T10:21", status: "Opened", comment: "Request verification." },
      { time: "2025-10-21T17:42", status: "Investigating", comment: "Admin reviewing." }
    ]
  }
];

export default function DisputePanel() {
  const [disputes, setDisputes] = useState(DUMMY_DISPUTES);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState("");

  // Action: resolve/close
  function handleResolve(dpId) {
    setDisputes(ds =>
      ds.map(d =>
        d.id === dpId ? { ...d, status: "Closed", history: [...d.history, { time: new Date().toISOString(), status: "Closed", comment: "Admin closed dispute." }] } : d
      )
    );
    setSelected(null);
    setToast("Dispute marked as Closed.");
    setTimeout(() => setToast(""), 1800);
  }

  // Add comment/action
  function addAction(dpId) {
    if (!comment) return;
    setDisputes(ds =>
      ds.map(d =>
        d.id === dpId ? { ...d, history: [...d.history, { time: new Date().toISOString(), status: d.status, comment }] } : d
      )
    );
    setComment("");
    setToast("Action recorded!");
    setTimeout(() => setToast(""), 1600);
  }

  //------------------ RENDER ------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7e5ff] to-[#ddffea] px-4 pt-14 pb-28">
      <motion.section className="max-w-5xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-10 mb-7"
        initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-green-900 mb-8">Dispute Resolution Centre</h2>
        <div className="flex flex-col gap-5">
          {disputes.length === 0 ? (
            <div className="text-gray-500 text-center py-10">No disputes at the moment!</div>
          ) : (
            disputes.map(d => (
              <motion.div
                key={d.id}
                className={`p-6 rounded-xl shadow border-l-8 mb-3 transition ${d.status==="Closed"?"border-gray-400 bg-gray-50":"border-red-400 bg-red-50/80"}`}
                whileHover={{ scale: 1.018, boxShadow: "0 20px 40px #ffd6e7" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-lg text-red-900">#{d.id} ({d.subject})</span>
                  <span className={`status-tag ${d.status==="Closed"?"status-closed":d.status==="Investigating"?"status-pending":"status-pending"} mx-2`}>
                    {d.status}
                  </span>
                </div>
                <div className="mb-1">
                  <span className={`px-2 py-1 rounded-lg text-xs mr-2 bg-${d.role==="seller"?"yellow":"green"}-200 text-${d.role==="seller"?"yellow":"green"}-800`}>
                    {d.role}
                  </span>
                  <span className="font-medium">{d.raisedBy}</span>
                </div>
                <div className="mb-2 text-gray-700 italic">"{d.message}"</div>
                {/* Actions */}
                <div className="flex gap-4 items-center mt-2">
                  <AnimatedButton color="secondary" size="sm" label="View" onClick={()=>setSelected(d)} />
                  {d.status !== "Closed" && (
                    <AnimatedButton color="danger" size="sm" label="Mark Closed" onClick={()=>handleResolve(d.id)} />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>
      {/* Modal for Dispute Details/Comments */}
      <AnimatePresence>
        {selected && (
          <motion.div className="modal-bg z-[120]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={()=>setSelected(null)}
          >
            <motion.div
              className="modal-content max-w-xl"
              initial={{ scale: 0.98, y: 23, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 23, opacity: 0 }}
              tabIndex={0}
              role="dialog"
              aria-modal="true"
              onClick={e=>e.stopPropagation()}
            >
              <div className="font-bold text-lg text-red-900 mb-3">Dispute #{selected.id}</div>
              <div><strong>Status:</strong> <span className={`status-tag ${selected.status==="Closed"?"status-closed":selected.status==="Investigating"?"status-pending":"status-pending"}`}>{selected.status}</span></div>
              <div className="my-2"><strong>By: </strong><span className="font-bold">{selected.raisedBy}</span></div>
              <div className="my-2"><strong>Subject: </strong><span>{selected.subject}</span></div>
              <div className="my-2"><strong>Details: </strong><span>{selected.message}</span></div>
              <div className="mt-5 mb-1 text-green-800 font-semibold">Action/Comment History</div>
              <ul className="text-xs max-h-28 overflow-auto space-y-2">
                {selected.history.map((h,i)=>(
                  <li key={i} className="bg-green-50 rounded px-3 py-1">
                    <span className="font-bold">{new Date(h.time).toLocaleString()}</span> — <i>{h.status}</i> — {h.comment}
                  </li>
                ))}
              </ul>
              {selected.status !== "Closed" && (
                <form className="mt-6 flex gap-2 items-center" onSubmit={e=>{e.preventDefault();addAction(selected.id);}}>
                  <input
                    value={comment}
                    onChange={e=>setComment(e.target.value)}
                    placeholder="Type action/comment"
                    className="flex-1 px-3 rounded border border-green-200"
                  />
                  <AnimatedButton color="primary" size="sm" type="submit" label="Add Comment" />
                </form>
              )}
              <AnimatedButton color="outline" className="mt-4" label="Close" onClick={()=>setSelected(null)}/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 19 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 19 }}
          >{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
