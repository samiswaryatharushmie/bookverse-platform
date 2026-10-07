import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Loader2, Ticket as TicketIcon, Search, Send, Trash2 } from 'lucide-react';

export default function SupportDashboard() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['adminTickets'],
    queryFn: async () => {
      const res = await apiClient.get('/staff/tickets');
      return res.data.data;
    }
  });

  const { data: replies = [], isLoading: isLoadingReplies } = useQuery({
    queryKey: ['ticketReplies', selectedTicket],
    queryFn: async () => {
      const res = await apiClient.get(`/staff/tickets/${selectedTicket}/replies`);
      return res.data.data;
    },
    enabled: !!selectedTicket
  });

  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      await apiClient.post(`/staff/tickets/${selectedTicket}/replies`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketReplies', selectedTicket] });
      setReplyText('');
      toast.success('Reply sent');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await apiClient.put(`/staff/tickets/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      toast.success('Status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/staff/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      setSelectedTicket(null);
      toast.success('Ticket deleted successfully');
    }
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      replyMutation.mutate(replyText);
    }
  };

  const filteredTickets = tickets.filter((t: any) => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTicket = tickets.find((t: any) => t.id === selectedTicket);

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Support Dashboard</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Manage and respond to customer support tickets.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Ticket List */}
        <div className="lg:col-span-1 card p-0 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Ticket Queue</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center text-[var(--color-text-muted)] p-8">No tickets found</div>
            ) : (
              filteredTickets.map((ticket: any) => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedTicket === ticket.id ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-surface)]'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[var(--color-text-muted)]">{ticket.userEmail}</span>
                    <span className={`badge text-[10px] ${ticket.status === 'CLOSED' ? 'badge-success' : 'badge-accent'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="font-medium text-[var(--color-text-primary)] text-sm line-clamp-2">{ticket.subject}</h3>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail / Chat */}
        <div className="lg:col-span-2 card h-full flex flex-col overflow-hidden p-0">
          {selectedTicket && activeTicket ? (
            <>
              <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-2">{activeTicket.subject}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
                    <span>From: {activeTicket.userEmail}</span>
                    <span>Type: {activeTicket.type}</span>
                    {activeTicket.orderNumber && <span>Order: {activeTicket.orderNumber}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: activeTicket.id, status: e.target.value })}
                    className="input py-1.5 text-sm"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this support ticket? This action cannot be undone.')) {
                        deleteMutation.mutate(activeTicket.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="btn btn-secondary p-2 text-red-500 hover:border-red-500 hover:text-red-500"
                    title="Delete Ticket"
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-[var(--color-bg-surface)]/50">
                {isLoadingReplies ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" /></div>
                ) : (
                  replies.map((reply: any) => (
                    <div key={reply.id} className={`flex ${reply.isStaffReply ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl p-4 ${reply.isStaffReply ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-primary)] border border-[var(--color-border)]'}`}>
                        <div className="flex items-center justify-between mb-2 gap-4">
                          <span className="text-xs font-semibold opacity-80">{reply.userName} {reply.isStaffReply && '(You)'}</span>
                          <span className="text-[10px] opacity-70">{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleReplySubmit} className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                <div className="flex gap-3">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply to the customer..."
                    className="input flex-1 resize-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!replyText.trim() || replyMutation.isPending}
                    className="btn btn-primary px-6 flex items-center justify-center"
                  >
                    {replyMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)]">
              <TicketIcon className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
