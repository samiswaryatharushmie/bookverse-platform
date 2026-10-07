import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';
import { Loader2, Ticket as TicketIcon, Send, Clock, AlertCircle, MessageCircle } from 'lucide-react';

export default function MyTicketsPage() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['myTickets'],
    queryFn: async () => {
      const res = await apiClient.get('/support/tickets');
      return res.data.data;
    }
  });

  const { data: replies = [], isLoading: isLoadingReplies } = useQuery({
    queryKey: ['ticketReplies', selectedTicket],
    queryFn: async () => {
      const res = await apiClient.get(`/support/tickets/${selectedTicket}/replies`);
      return res.data.data;
    },
    enabled: !!selectedTicket
  });

  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      await apiClient.post(`/support/tickets/${selectedTicket}/replies`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketReplies', selectedTicket] });
      setReplyText('');
      toast.success('Reply sent');
    }
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      replyMutation.mutate(replyText);
    }
  };

  const activeTicket = tickets.find((t: any) => t.id === selectedTicket);

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">My Support Tickets</h1>
        <p className="text-[var(--color-text-muted)] mt-2">View and manage your support inquiries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          {tickets.length === 0 ? (
            <div className="card p-6 text-center text-[var(--color-text-muted)]">
              No tickets found.
            </div>
          ) : (
            tickets.map((ticket: any) => (
              <div 
                key={ticket.id} 
                onClick={() => setSelectedTicket(ticket.id)}
                className={`card p-4 cursor-pointer transition-all ${selectedTicket === ticket.id ? 'ring-2 ring-[var(--color-accent)]' : 'hover:bg-[var(--color-bg-surface)]'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">{ticket.type}</span>
                  <span className={`badge text-[10px] ${ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? 'badge-success' : 'badge-accent'}`}>
                    {ticket.status}
                  </span>
                </div>
                <h3 className="font-medium text-[var(--color-text-primary)] mb-1 line-clamp-1">{ticket.subject}</h3>
                <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="md:col-span-2">
          {selectedTicket && activeTicket ? (
            <div className="card h-full flex flex-col">
              <div className="p-5 border-b border-[var(--color-border)]">
                <h2 className="text-xl font-bold mb-2">{activeTicket.subject}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><TicketIcon className="h-4 w-4" /> {activeTicket.type}</span>
                  {activeTicket.orderNumber && <span className="flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Order: {activeTicket.orderNumber}</span>}
                </div>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-6 max-h-[500px]">
                {isLoadingReplies ? (
                  <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" /></div>
                ) : (
                  replies.map((reply: any) => (
                    <div key={reply.id} className={`flex ${reply.isStaffReply ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-xl p-4 ${reply.isStaffReply ? 'bg-[var(--color-bg-surface)] border border-[var(--color-border)]' : 'bg-[var(--color-accent)] text-white'}`}>
                        <div className="flex items-center justify-between mb-2 gap-4">
                          <span className="text-xs font-semibold opacity-80">{reply.userName} {reply.isStaffReply && '(Support)'}</span>
                          <span className="text-[10px] opacity-70">{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {activeTicket.status !== 'CLOSED' && (
                <form onSubmit={handleReplySubmit} className="p-5 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="input flex-1"
                    />
                    <button 
                      type="submit" 
                      disabled={!replyText.trim() || replyMutation.isPending}
                      className="btn btn-primary px-6 flex items-center justify-center gap-2"
                    >
                      {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] min-h-[300px]">
              <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a ticket to view conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
